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
      {
        $lookup: {
          from: 'services',
          localField: 'caseMembers.service', // `service` là một mảng các ID
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
          currentStatus: '$currentStatus.testRequestStatus',
          adnDocumentation: 1,
          result: 1,
          bookingDetails: {
            bookingDate: '$bookings.bookingDate',
            slotTime: '$slots.startTime',
          },
          accountDetails: {
            _id: '$accountDetails._id',
            name: '$accountDetails.name',
            phoneNumber: '$accountDetails.phoneNumber',
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
            isSingleService: '$caseMembers.isSingleService',
          },
        },
      },
    ])
  }
}
