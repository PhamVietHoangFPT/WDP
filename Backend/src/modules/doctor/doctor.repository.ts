import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'

import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { IDoctorRepository } from './interfaces/idoctor.repository'
@Injectable()
export class DoctorRepository implements IDoctorRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
  ) {}

  async getAllServiceCasesWithoutAdnDocumentation(
    facilityId: string,
    doctorId: string,
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          currentStatus: new Types.ObjectId(currentStatus), // Loc theo currentStatus
          doctor: new Types.ObjectId(doctorId),
          adnDocumentation: { $exists: resultExists },
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
      {
        $lookup: {
          from: 'services',
          let: { serviceId: '$caseMembers.service' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$serviceId'],
                },
              },
            },
          ],
          as: 'services',
        },
      },
      {
        $unwind: { path: '$services', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'timereturns',
          let: { timeReturnId: '$services.timeReturn' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$timeReturnId'],
                },
              },
            },
          ],
          as: 'timeReturns',
        },
      },
      {
        $unwind: {
          path: '$timeReturns',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'testtakers',
          // localField là trường chứa mảng các ID trong document hiện tại
          localField: 'caseMembers.testTaker',
          // foreignField là trường ID trong collection 'testtakers' để so khớp
          foreignField: '_id',
          // 'as' là tên của trường mới sẽ chứa mảng các document testTaker đã được populate
          as: 'populatedTestTakers',
        },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          currentStatus: 1,
          bookingDate: '$bookings.bookingDate',
          timeReturn: '$timeReturns.timeReturn',
          caseMember: {
            testTakers: {
              $map: {
                // input là mảng nguồn
                input: '$populatedTestTakers',
                // as là tên biến đại diện cho mỗi phần tử trong mảng
                as: 'taker',
                // in là cấu trúc của object mới sẽ được tạo ra
                in: {
                  _id: '$$taker._id',
                  name: '$$taker.name',
                  personalId: '$$taker.personalId',
                  dateOfBirth: '$$taker.dateOfBirth',
                  gender: '$$taker.gender',
                },
              },
            },
            sampleIdentifyNumbers: '$caseMembers.sampleIdentifyNumbers',
            isSelfSampling: '$caseMembers.isSelfSampling',
          },
        },
      },
    ])
  }
}
