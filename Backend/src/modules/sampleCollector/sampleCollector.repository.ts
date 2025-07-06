import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ISampleCollectorRepository } from './interfaces/isampleCollector.repository'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { Injectable } from '@nestjs/common'

@Injectable()
export class SampleCollectorRepository implements ISampleCollectorRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
    @InjectModel(TestRequestStatus.name)
    private readonly testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  async getAllServiceCaseForSampleCollector(
    sampleCollectorId: string,
    serviceCaseStatus: string,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          sampleCollector: new Types.ObjectId(sampleCollectorId),
          currentStatus: new Types.ObjectId(serviceCaseStatus),
        },
      },
      // Mo bang testrequeststatuses
      {
        $lookup: {
          from: 'testrequeststatuses',
          let: { originalStatusId: '$currentStatus' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$originalStatusId'],
                },
              },
            },
          ],
          as: 'statusDetails',
        },
      },
      // Mo mang statusDetails
      {
        $unwind: { path: '$statusDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'casemembers',
          let: { caseMemberId: '$caseMember' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$caseMemberId'],
                },
              },
            },
          ],
          as: 'caseMemberDetails',
        },
      },
      // Mo mang caseMemberDetails
      {
        $unwind: {
          path: '$caseMemberDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Mo bang bookings
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$caseMemberDetails.booking' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$bookingId'],
                },
              },
            },
          ],
          as: 'bookingDetails',
        },
      },
      // Mo mang bookingDetails
      {
        $unwind: { path: '$bookingDetails', preserveNullAndEmptyArrays: true },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          statusDetails: '$statusDetails.testRequestStatus',
          bookingDate: '$bookingDetails.bookingDate',
        },
      },
    ])
  }

  async getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  > {
    return this.testRequestStatusModel
      .find({
        order: { $in: [4, 5, 6] },
      })
      .sort({ order: 1 })
      .lean()
      .exec()
  }
}
