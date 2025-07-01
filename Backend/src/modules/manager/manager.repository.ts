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
import { Address, AddressDocument } from '../address/schemas/address.schema'

@Injectable()
export class ManagerRepository implements IManagerRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(ServiceCase.name)
    private readonly serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(IRoleRepository)
    private readonly roleRepository: IRoleRepository,
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<void> {
    await this.serviceCaseModel.findByIdAndUpdate(
      serviceCaseId,
      {
        sampleCollector: sampleCollectorId,
        updated_by: userId,
        updated_at: Date.now(),
      },
      { new: true },
    )
  }

  async getAllSampleCollectors(facilityId: string): Promise<AccountDocument[]> {
    // Lay role 'Sample Collector' tu bang Role
    const sampleCollectorRole =
      await this.roleRepository.getRoleIdByName('Sample Collector')

    const roleObjectId = new Types.ObjectId(sampleCollectorRole)

    return await this.accountModel.aggregate([
      // Giai đoạn 1: Lọc tài khoản theo vai trò và cơ sở
      {
        $match: {
          role: roleObjectId,
          facility: facilityId,
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

  async getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
  ): Promise<ServiceCase[]> {
    return this.serviceCaseModel
      .find({ sampleCollector: null, facility: facilityId })
      .lean()
      .exec()
  }
}
