import { IStaffRepository } from './interfaces/istaff.repository'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'

import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'

@Injectable()
export class StaffRepository implements IStaffRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
  ) {}

  async getServiceCasesByCustomerEmail(
    facilityId: string,
    email: string,
    currentStatus: string,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          // Lọc theo currentStatus nếu có
          ...(currentStatus && {
            currentStatus: new Types.ObjectId(currentStatus),
          }),
        },
      },
      // =================================================================
      // Giai đoạn 1: Tìm _id của khách hàng từ email
      // =================================================================
      {
        $lookup: {
          from: 'accounts',
          let: { customerEmail: email },
          pipeline: [
            { $match: { $expr: { $eq: ['$email', '$$customerEmail'] } } },
            { $project: { _id: 1 } },
          ],
          as: 'customerInfo',
        },
      },
      {
        // Nếu không tìm thấy customer nào với email này, sẽ không có kết quả nào
        $unwind: '$customerInfo',
      },
      {
        $lookup: {
          from: 'casemembers',
          let: { caseMemberIdFromServiceCase: '$caseMember' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$caseMemberIdFromServiceCase'],
                },
              },
            },
          ],
          as: 'casemembersInfo',
        },
      },
      {
        $unwind: '$casemembersInfo',
      },
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$casemembersInfo.booking' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$bookingId'],
                },
              },
            },
          ],
          as: 'booking',
        },
      },
      { $unwind: '$booking' },
      {
        $lookup: {
          from: 'slots',
          localField: 'booking.slot',
          foreignField: '_id',
          as: 'slot',
        },
      },
      { $unwind: '$slot' },
      {
        $lookup: {
          from: 'slottemplates',
          localField: 'slot.slotTemplate',
          foreignField: '_id',
          as: 'slotTemplate',
        },
      },
      { $unwind: '$slotTemplate' },
      {
        // Lọc các case thuộc về cơ sở của staff
        $match: {
          'slotTemplate.facility': new Types.ObjectId(facilityId),
        },
      },

      // =================================================================
      // Giai đoạn 4: Lấy thêm thông tin phụ và định dạng đầu ra
      // =================================================================
      {
        $lookup: {
          from: 'testrequeststatuses',
          localField: 'currentStatus',
          foreignField: '_id',
          as: 'currentStatusInfo',
        },
      },
      {
        $project: {
          _id: 1,
          customer: '$customerInfo._id',
          // Sử dụng $arrayElemAt để lấy object status thay vì mảng
          currentStatus: {
            $arrayElemAt: ['$currentStatusInfo.testRequestStatus', 0],
          },
          bookingDate: '$booking.bookingDate',
          // Lưu ý: 'timeReturns' không được join trong câu lệnh của bạn
          // timeReturn: '$timeReturns.timeReturn',
          caseMember: {
            testTaker: '$casemembersInfo.testTaker',
          },
        },
      },
    ])
  }
}
