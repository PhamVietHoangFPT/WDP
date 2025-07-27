import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { IDeliveryStaffRepository } from './interfaces/ideliveryStaff.repository'

@Injectable()
export class DeliveryStaffRepository implements IDeliveryStaffRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
  ) {}

  async findAllServiceCasesByDeliveryStaffId(
    deliveryStaffId: string,
    currentStatus: string,
    facilityId: string,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel.aggregate([
      {
        $match: {
          currentStatus: new Types.ObjectId(currentStatus), // Loc theo currentStatus
          deliveryStaff: new Types.ObjectId(deliveryStaffId),
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
      {
        $unwind: {
          path: '$accountDetails',
          preserveNullAndEmptyArrays: true,
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
      {
        $lookup: {
          from: 'addresses',
          let: { addressId: '$caseMembers.address' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$addressId'],
                },
              },
            },
          ],
          as: 'addresses',
        },
      },
      {
        $unwind: {
          path: '$addresses',
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
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          currentStatus: 1,
          address: {
            _id: '$addresses._id',
            fullAddress: '$addresses.fullAddress',
            location: '$addresses.location',
          },
          account: {
            _id: '$accountDetails._id',
            name: '$accountDetails.name',
            phoneNumber: '$accountDetails.phoneNumber',
          },
          bookingDate: '$bookings.bookingDate',
          timeReturn: '$timeReturns.timeReturn',
          caseMember: {
            testTaker: '$caseMembers.testTaker',
          },
        },
      },
    ])
  }
}
