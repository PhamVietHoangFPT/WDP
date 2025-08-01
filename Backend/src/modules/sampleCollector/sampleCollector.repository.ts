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
    isAtHome: boolean,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          sampleCollector: new Types.ObjectId(sampleCollectorId),
          currentStatus: new Types.ObjectId(serviceCaseStatus),
        },
      },
      {
        $lookup: {
          from: 'accounts',
          let: { accountId: '$account' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$accountId'],
                },
              },
            },
          ],
          as: 'accountDetails',
        },
      },
      // Mo mang accountDetails
      {
        $unwind: { path: '$accountDetails', preserveNullAndEmptyArrays: true },
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
      {
        $match: {
          'caseMemberDetails.isAtHome': isAtHome, // Lọc chính xác các serviceCase có casemember isAtHome mong muốn
        },
      },
      {
        $lookup: {
          from: 'testtakers',
          // localField là trường chứa mảng các ID trong document hiện tại
          localField: 'caseMemberDetails.testTaker',
          // foreignField là trường ID trong collection 'testtakers' để so khớp
          foreignField: '_id',
          // 'as' là tên của trường mới sẽ chứa mảng các document testTaker đã được populate
          as: 'populatedTestTakers',
        },
      },
      {
        $lookup: {
          from: 'addresses',
          let: { addressId: '$caseMemberDetails.address' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$addressId'],
                },
              },
            },
          ],
          as: 'addressDetails',
        },
      },
      {
        $unwind: {
          path: '$addressDetails',
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
      // Mo bang services
      {
        $lookup: {
          from: 'services',
          localField: 'caseMemberDetails.service', // `service` là một mảng các ID
          foreignField: '_id',
          as: 'serviceDetails', // Kết quả trả về sẽ là một mảng các object service
        },
      },
      // Mo bang time return
      {
        $lookup: {
          from: 'timereturns',
          localField: 'serviceDetails.timeReturn',
          foreignField: '_id',
          as: 'allTimeReturnDetails', // Lưu tất cả vào một mảng tạm
        },
      },
      {
        $lookup: {
          from: 'samples',
          localField: 'serviceDetails.sample',
          foreignField: '_id',
          as: 'allSampleDetails', // Lưu tất cả vào một mảng tạm
        },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          currentStatus: '$statusDetails.testRequestStatus',
          bookingDate: '$bookingDetails.bookingDate',
          accountDetails: {
            _id: '$accountDetails._id',
            name: '$accountDetails.name',
            phoneNumber: '$accountDetails.phoneNumber',
            address: {
              fullAddress: '$addressDetails.fullAddress',
              location: '$addressDetails.location',
            },
          },
          services: {
            $map: {
              input: '$serviceDetails',
              as: 'service',
              in: {
                _id: '$$service._id',
                name: '$$service.name',
                fee: '$$service.fee',
                sample: {
                  $let: {
                    // Tìm object sample tương ứng trong mảng allSampleDetails
                    vars: {
                      matchingSample: {
                        $first: {
                          $filter: {
                            input: '$allSampleDetails',
                            as: 'sd',
                            cond: { $eq: ['$$sd._id', '$$service.sample'] },
                          },
                        },
                      },
                    },
                    // Nếu tìm thấy, chỉ lấy các trường cần thiết
                    in: {
                      _id: '$$matchingSample._id',
                      name: '$$matchingSample.name',
                      fee: '$$matchingSample.fee',
                    },
                  },
                },
                // ✅ LOGIC MỚI ĐỂ LẤY VÀ ĐỊNH DẠNG timeReturn
                timeReturn: {
                  $let: {
                    // 1. Tìm object timeReturn tương ứng trong mảng allTimeReturnDetails
                    vars: {
                      matchingTimeReturn: {
                        $first: {
                          $filter: {
                            input: '$allTimeReturnDetails',
                            as: 'trd',
                            cond: {
                              $eq: ['$$trd._id', '$$service.timeReturn'],
                            },
                          },
                        },
                      },
                    },
                    // 2. Nếu tìm thấy, thực hiện $concat
                    in: {
                      $concat: [
                        { $toString: '$$matchingTimeReturn.timeReturn' },
                        ' ngày',
                      ],
                    },
                  },
                },
              },
            },
          },
          caseMember: {
            testTakers: {
              $map: {
                input: '$populatedTestTakers',
                as: 'taker',
                in: {
                  _id: '$$taker._id',
                  name: '$$taker.name',
                  personalId: '$$taker.personalId',
                  dateOfBirth: '$$taker.dateOfBirth',
                  gender: '$$taker.gender',
                },
              },
            },
            sampleIdentifyNumbers: '$caseMemberDetails.sampleIdentifyNumbers',
            isSelfSampling: '$caseMemberDetails.isSelfSampling',
            isSingleService: '$caseMemberDetails.isSingleService',
          },
        },
      },
    ])
  }

  async getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  > {
    return this.testRequestStatusModel
      .find({
        order: { $in: [2, 3, 4, 5, 6] },
      })
      .sort({ order: 1 })
      .lean()
      .exec()
  }
}
