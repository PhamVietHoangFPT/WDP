import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'

import { Inject, Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { IDoctorRepository } from './interfaces/idoctor.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(ITestRequestStatusRepository)
    private readonly testRequestStatusRepository: ITestRequestStatusRepository,
  ) {}

  async getAllServiceCasesWithoutResults(
    facilityId: string,
  ): Promise<ServiceCaseDocument[]> {
    const testRequestStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ duyệt kết quả',
      )
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          currentStatus: new Types.ObjectId(testRequestStatus),
          result: { $exists: false },
        },
      },
      // Mo bang testRequestStatuses
      {
        $lookup: {
          from: 'testrequeststatuses',
          localField: 'currentStatus',
          foreignField: '_id',
          as: 'currentStatus',
        },
      },
      {
        $unwind: '$currentStatus',
      },
      // Mo bang caseMembers
      {
        $lookup: {
          from: 'casemembers',
          let: { caseMemberIdFromServiceCase: '$caseMember' }, // Đặt tên biến rõ ràng hơn
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$caseMemberIdFromServiceCase'], // Sử dụng biến đã đặt
                },
              },
            },
          ],
          as: 'caseMembers',
        },
      },
      {
        $unwind: {
          path: '$caseMembers',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Mo bang bookings
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$caseMembers.booking' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$bookingId'],
                },
              },
            },
          ],
          as: 'bookings',
        },
      },
      {
        $unwind: {
          path: '$bookings',
          preserveNullAndEmptyArrays: true,
        },
      },
      // mo bang slot
      {
        $lookup: {
          from: 'slots',
          let: { slotId: { $toObjectId: '$bookings.slot' } }, // Chuyển đổi trực tiếp trong let
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$slotId'],
                },
              },
            },
          ],
          as: 'slots',
        },
      },
      {
        $unwind: {
          path: '$slots',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Mo bang slotTemplates
      {
        $lookup: {
          from: 'slottemplates',
          let: { slotTemplateId: '$slots.slotTemplate' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$slotTemplateId'],
                },
              },
            },
          ],
          as: 'slotTemplates',
        },
      },
      // Mo mang slotTemplates
      {
        $unwind: { path: '$slotTemplates', preserveNullAndEmptyArrays: true },
      },
      // Mo bang facilities
      {
        $lookup: {
          from: 'facilities',
          let: { facilityId: '$slotTemplates.facility' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$_id', '$$facilityId'] },
                    { $eq: ['$_id', new Types.ObjectId(facilityId)] },
                  ],
                },
              },
            },
          ],
          as: 'facilities',
        },
      },
      // Mo bang facilities
      {
        $unwind: { path: '$facilities', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'facilities._id': new Types.ObjectId(facilityId), // Loc theo facilityId
        },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          currentStatus: 1,
          caseMember: '$caseMembers._id',
          facility: {
            name: '$facilities.facilityName',
          },
        },
      },
    ])
  }
}
