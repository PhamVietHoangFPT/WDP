import {
  Account,
  AccountDocument,
} from 'src/modules/account/schemas/account.schema'
import {
  ServiceCase,
  ServiceCaseDocument,
} from 'src/modules/serviceCase/schemas/serviceCase.schema'
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { IManagerRepository } from './interfaces/imanager.repository'
import { IRoleRepository } from '../role/interfaces/irole.repository'

import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
import { Role, RoleDocument } from '../role/schemas/role.schema'
import { hashPassword } from 'src/utils/hashPassword'
import { KitShipment, KitShipmentDocument } from '../KitShipment/schemas/kitShipment.schema'

@Injectable()
export class ManagerRepository implements IManagerRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    @Inject(ITestRequestStatusRepository)
    private readonly testRequestStatusRepository: ITestRequestStatusRepository,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(KitShipment.name)
    private readonly kitShipmentModel: Model<KitShipmentDocument>,
  ) { }

  async assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<ServiceCaseDocument> {
    const sampleCollectorIdObjectId = new Types.ObjectId(sampleCollectorId)
    const userIdObjectId = new Types.ObjectId(userId)
    const data = await this.serviceCaseModel.findByIdAndUpdate(
      serviceCaseId,
      {
        sampleCollector: sampleCollectorIdObjectId,
        updated_by: userIdObjectId,
        updated_at: Date.now(),
      },
      { new: true },
    )
    return data
  }
  async assignDeliveryStaffToKitShipment(
    kitShipmentId: string,
    deliveryStaffId: string,
    userId: string,
  ): Promise<KitShipmentDocument> {
    const deliveryStaffIdObjectId = new Types.ObjectId(deliveryStaffId)
    const userIdObjectId = new Types.ObjectId(userId)
    const data = await this.kitShipmentModel.findByIdAndUpdate(
      kitShipmentId,
      {
        deliveryStaff: deliveryStaffIdObjectId,
        updated_by: userIdObjectId,
        updated_at: Date.now(),
      },
      { new: true },
    )
    return data
  }

  async assignDoctorToServiceCase(
    serviceCaseId: string,
    doctorId: string,
    userId: string,
  ): Promise<ServiceCaseDocument> {
    const doctorIdObjectId = new Types.ObjectId(doctorId)
    const updated_byObjectId = new Types.ObjectId(userId)
    const data = await this.serviceCaseModel.findByIdAndUpdate(
      serviceCaseId,
      {
        doctor: doctorIdObjectId,
        updated_by: updated_byObjectId,
        updated_at: Date.now(),
      },
      { new: true },
    )
    return data
  }

  async getAllSampleCollectors(facilityId: string): Promise<AccountDocument[]> {
    // Lay role 'Sample Collector' tu bang Role
    const sampleCollectorRole =
      await this.roleRepository.getRoleIdByName('Sample Collector')

    const roleObjectId = new Types.ObjectId(sampleCollectorRole)
    const facilityIdObject = new Types.ObjectId(facilityId)
    return await this.accountModel.aggregate([
      // Giai đoạn 1: Lọc tài khoản theo vai trò và cơ sở
      {
        $match: {
          role: roleObjectId,
          facility: facilityIdObject,
        },
      },
      // Giai đoạn 2: Kết nối với collection 'addresses'
      {
        $lookup: {
          from: 'addresses',
          let: { accountIdVar: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$account', '$$accountIdVar'],
                },
              },
            },
          ],
          as: 'address',
        },
      },
      // Giai đoạn 3: Mở mảng 'address'
      {
        $unwind: { path: '$address', preserveNullAndEmptyArrays: true },
      },
      // Giai đoạn 4: Lọc so sánh ID
      {
        $match: {
          $expr: {
            // $eq dùng để kiểm tra sự bằng nhau (equals)
            // So sánh trường 'account' trong 'address' với '_id' của 'account' gốc
            $eq: ['$address.account', '$_id'],
          },
        },
      },
      // Giai đoạn 5: Chọn lọc và định dạng kết quả
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          phoneNumber: 1,
          addressInfo: '$address.fullAddress', // Lấy toàn bộ thông tin địa chỉ
        },
      },
    ])
  }

  async getAllDoctors(facilityId: string): Promise<AccountDocument[]> {
    // Lay role 'Doctor' tu bang Role
    const doctorRole = await this.roleRepository.getRoleIdByName('Doctor')

    const roleObjectId = new Types.ObjectId(doctorRole)
    const facilityIdObject = new Types.ObjectId(facilityId)

    return await this.accountModel.aggregate([
      // Giai đoạn 1: Lọc tài khoản theo vai trò và cơ sở
      {
        $match: {
          role: roleObjectId,
          facility: facilityIdObject,
        },
      },
      // Giai đoạn 2: Kết nối với collection 'addresses'
      {
        $lookup: {
          from: 'addresses',
          let: { accountIdVar: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$account', '$$accountIdVar'],
                },
              },
            },
          ],
          as: 'address',
        },
      },
      // Giai đoạn 3: Mở mảng 'address'
      {
        $unwind: { path: '$address', preserveNullAndEmptyArrays: true },
      },
      // Giai đoạn 5: Chọn lọc và định dạng kết quả
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          phoneNumber: 1,
          addressInfo: '$address.fullAddress', // Lấy toàn bộ thông tin địa chỉ
        },
      },
    ])
  }

  async getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
    isAtHome: boolean,
    bookingDate: string,
  ): Promise<ServiceCase[]> {
    const bookingDateConvert = new Date(bookingDate)
    const headOrderValue = 2
    const tailOrderValue = 12
    return await this.serviceCaseModel.aggregate([
      {
        $match: {
          sampleCollector: null,
        },
      },
      {
        $lookup: {
          from: 'testrequeststatuses',
          let: { statusId: '$currentStatus' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$statusId'],
                },
              },
            },
          ],
          as: 'testRequestStatuses',
        },
      },
      {
        $unwind: {
          path: '$testRequestStatuses',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'testRequestStatuses.order': {
            $gte: headOrderValue,
            $lte: tailOrderValue,
          }, // Lọc theo order >= 2 và <= 12
        },
      },
      // Ket noi voi casemembers
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
          as: 'caseMembers',
        },
      },
      // Mo mang caseMembers
      {
        $unwind: { path: '$caseMembers', preserveNullAndEmptyArrays: true },
      },
      // Loc serviceCase theo isAtHome
      {
        $match: {
          'caseMembers.isAtHome': isAtHome, // Lọc chính xác các serviceCase có casemember isAtHome mong muốn
        },
      },
      // Tim booking trong caseMembers
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
      // Mo mang bookings
      {
        $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'bookings.bookingDate': bookingDateConvert, // Lọc theo ngày đặt lịch
        },
      },
      // Ket noi voi slots
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
      // Mo mang slots
      {
        $unwind: { path: '$slots', preserveNullAndEmptyArrays: true },
      },
      // ket noi voi slottemplates
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
      // ket noi voi facilities
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
      // Ket noi voi accounts
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
          as: 'accounts',
        },
      },
      // Mo mang accounts
      {
        $unwind: { path: '$accounts', preserveNullAndEmptyArrays: true },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          totalFee: 1,
          account: {
            _id: '$accounts._id',
            name: '$accounts.name',
            email: '$accounts.email',
            phoneNumber: '$accounts.phoneNumber',
          },
          currentStatus: '$testRequestStatuses.testRequestStatus',
          bookingDate: '$bookings.bookingDate',
          bookingTime: '$slots.startTime',
          facility: {
            _id: '$facilities._id',
            name: '$facilities.facilityName',
          },
        },
      },
    ])
  }

  async getAllKitShipmentWithoutDeliveryStaff(
    facilityId: string,
    bookingDate: string,
  ): Promise<KitShipment[]> {
    const bookingDateConvert = new Date(bookingDate)
    bookingDateConvert.setHours(0, 0, 0, 0)

    const nextDate = new Date(bookingDateConvert)
    nextDate.setDate(nextDate.getDate() + 1)

    return await this.kitShipmentModel.aggregate([
      // B1: Chưa có deliveryStaff
      {
        $match: {
          deliveryStaff: null,
        },
      },
      // B2: Join caseMembers
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
          as: 'caseMembers',
        },
      },
      { $unwind: { path: '$caseMembers', preserveNullAndEmptyArrays: true } },

      // B3: Join bookings
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
      { $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true } },

      // B4: Lọc theo bookingDate (chính xác 1 ngày)
      {
        $match: {
          'bookings.bookingDate': {
            $gte: bookingDateConvert,
            $lt: nextDate,
          },
        },
      },
      {
        $lookup: {
          from: 'accounts',
          let: { accountId: '$bookings.account' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$accountId'],
                },
              },
            },
          ],
          as: 'accounts',
        },
      },
      { $unwind: { path: '$accounts', preserveNullAndEmptyArrays: true } },
      // B5: Join slots
      {
        $lookup: {
          from: 'slots',
          let: { slotId: { $toObjectId: '$bookings.slot' } },
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
      { $unwind: { path: '$slots', preserveNullAndEmptyArrays: true } },

      // B6: Join slotTemplates
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
      { $unwind: { path: '$slotTemplates', preserveNullAndEmptyArrays: true } },

      // B7: Join facilities và lọc theo facilityId
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
      { $unwind: { path: '$facilities', preserveNullAndEmptyArrays: true } },
      // B9: Project kết quả
      {
        $project: {
          _id: 1,
          deliveryStatus: 1,
          createdAt: 1,
          account: {
            _id: '$accounts._id',
            name: '$accounts.name',
            email: '$accounts.email',
            phoneNumber: '$accounts.phoneNumber',
          },
          bookingDate: '$bookings.bookingDate',
          bookingTime: '$slots.startTime',
          facility: {
            _id: '$facilities._id',
            name: '$facilities.facilityName',
          },
        },
      },
    ])
  }


  async getAllServiceCaseWithoutDoctor(
    facilityId: string,
    bookingDate: string,
  ): Promise<ServiceCase[]> {
    const bookingDateConvert = new Date(bookingDate)
    const headOrderValue = 2 // Giá trị order để lọc
    const tailOrderValue = 11 // Giá trị order để lọc
    return await this.serviceCaseModel.aggregate([
      {
        $match: {
          doctor: null,
        },
      },
      {
        $lookup: {
          from: 'testrequeststatuses',
          let: { statusId: '$currentStatus' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$statusId'],
                },
              },
            },
          ],
          as: 'testRequestStatuses',
        },
      },
      {
        $unwind: {
          path: '$testRequestStatuses',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'testRequestStatuses.order': {
            $gte: headOrderValue,
            $lte: tailOrderValue,
          }, // Lọc theo order >= 2 và <= 12
        },
      },
      // Ket noi voi casemembers
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
          as: 'caseMembers',
        },
      },
      // Mo mang caseMembers
      {
        $unwind: { path: '$caseMembers', preserveNullAndEmptyArrays: true },
      },
      // Tim booking trong caseMembers
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
      // Mo mang bookings
      {
        $unwind: { path: '$bookings', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          'bookings.bookingDate': bookingDateConvert, // Lọc theo ngày đặt lịch
        },
      },
      // Ket noi voi slots
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
      // Mo mang slots
      {
        $unwind: { path: '$slots', preserveNullAndEmptyArrays: true },
      },
      // ket noi voi slottemplates
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
      // ket noi voi facilities
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
      // Ket noi voi accounts
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
          as: 'accounts',
        },
      },
      // Mo mang accounts
      {
        $unwind: { path: '$accounts', preserveNullAndEmptyArrays: true },
      },
      // Chon truong can thiet
      {
        $project: {
          _id: 1,
          totalFee: 1,
          account: {
            _id: '$accounts._id',
            name: '$accounts.name',
            email: '$accounts.email',
            phoneNumber: '$accounts.phoneNumber',
          },
          currentStatus: '$testRequestStatuses.testRequestStatus',
          bookingDate: '$bookings.bookingDate',
          bookingTime: '$slots.startTime',
          facility: {
            _id: '$facilities._id',
            name: '$facilities.facilityName',
          },
          created_at: 1,
        },
      },
    ])
  }

  async getAllDeliveryStaff(facilityId: string): Promise<AccountDocument[]> {
    const deliveryStaffRole =
      await this.roleRepository.getRoleIdByName('Delivery Staff')
    const roleObjectId = new Types.ObjectId(deliveryStaffRole)
    const facilityIdObject = new Types.ObjectId(facilityId)
    return await this.accountModel.aggregate([
      // Giai đoạn 1: Lọc tài khoản theo vai trò và cơ sở
      {
        $match: {
          role: roleObjectId,
          facility: facilityIdObject,
        },
      },
      // Giai đoạn 2: Kết nối với collection 'addresses'
      {
        $lookup: {
          from: 'addresses',
          let: { accountIdVar: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$account', '$$accountIdVar'],
                },
              },
            },
          ],
          as: 'address',
        },
      },
      // Giai đoạn 3: Mở mảng 'address'
      {
        $unwind: { path: '$address', preserveNullAndEmptyArrays: true },
      },
      // Giai đoạn 5: Chọn lọc và định dạng kết quả
      {
        $project: {
          _id: 1,
          email: 1,
          name: 1,
          phoneNumber: 1,
          addressInfo: '$address.fullAddress', // Lấy toàn bộ thông tin địa chỉ
        },
      },
    ])
  }

  async managerCreateAccount(
    accountData: Partial<AccountDocument>,
    userId: string,
    facilityId: string,
  ): Promise<AccountDocument> {
    const passwordHash = await hashPassword('123456')
    accountData.password = passwordHash
    const newAccount = await this.accountModel.create({
      ...accountData,
      created_by: new Types.ObjectId(userId),
      facility: new Types.ObjectId(facilityId),
    })
    return newAccount
  }

  async managerGetAllRoles(): Promise<RoleDocument[]> {
    return await this.roleModel
      .find({
        role: { $nin: ['Admin', 'Manager', 'Customer'] }, // Loại bỏ cả 'Admin' và 'Manager'
      })
      .exec()
  }
}
