import { IAdminRepository } from './interfaces/iadmin.repository'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Account, AccountDocument } from '../account/schemas/account.schema'
import { Facility, FacilityDocument } from '../facility/schemas/facility.schema'
import { Types } from 'mongoose'

@Injectable()
export class AdminRepository implements IAdminRepository {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<AccountDocument>,
    @InjectModel(Facility.name)
    private readonly facilityModel: Model<FacilityDocument>,
  ) {}

  async createManagerAccount(
    accountData: Partial<Account>,
    userId: string,
    managerRoleId: string,
  ): Promise<AccountDocument> {
    const createdManager = new this.accountModel({
      ...accountData,
      created_by: new Types.ObjectId(userId),
      created_at: new Date(),
      role: new Types.ObjectId(managerRoleId),
    })
    return createdManager.save()
  }

  async getAllManagers(managerRoleId: string): Promise<AccountDocument[]> {
    return this.accountModel
      .find({ role: new Types.ObjectId(managerRoleId), deleted_at: null }) // Exclude the current manager
      .exec()
  }
  async deleteManagerAccount(
    id: string,
    userId: string,
  ): Promise<AccountDocument | null> {
    return this.accountModel.findByIdAndUpdate(
      id,
      {
        deleted_at: new Date(),
        deleted_by: new Types.ObjectId(userId),
      },
      { new: true },
    )
  }

  async assignManagerToFacility(
    managerId: string,
    facilityId: string,
    userId: string,
  ): Promise<AccountDocument | null> {
    await this.facilityModel.findByIdAndUpdate(facilityId, {
      account: new Types.ObjectId(managerId),
    })
    return this.accountModel.findByIdAndUpdate(
      managerId,
      {
        facility: new Types.ObjectId(facilityId),
        updated_by: new Types.ObjectId(userId),
        updated_at: new Date(),
      },
      { new: true },
    )
  }

  async unassignManagerFromFacility(
    facilityId: string,
    managerId: string,
    userId: string,
  ): Promise<FacilityDocument | null> {
    await this.accountModel.findByIdAndUpdate(
      managerId,
      {
        facility: null,
        updated_by: new Types.ObjectId(userId),
        updated_at: new Date(),
      },
      { new: true },
    )
    return this.facilityModel.findByIdAndUpdate(
      facilityId,
      {
        account: null,
        updated_by: new Types.ObjectId(userId),
        updated_at: new Date(),
      },
      { new: true },
    )
  }

  async getAllFacilities(withManager: boolean): Promise<FacilityDocument[]> {
    if (withManager) {
      return this.facilityModel
        .find({ account: { $ne: null } })
        .populate({ path: 'account', select: 'name email phoneNumber' })
        .populate({ path: 'address', select: 'fullAddress _id location' })
        .lean()
        .exec()
    }

    return this.facilityModel
      .find({ account: null })
      .populate({ path: 'address', select: 'fullAddress _id location' })
      .lean()
      .exec()
  }

  async validateAssignment(
    managerId: string,
    facilityId: string,
  ): Promise<boolean> {
    // Tạo 2 promise để kiểm tra song song
    const managerCheckPromise = this.facilityModel
      .findOne({
        account: new Types.ObjectId(managerId),
      })
      .lean()

    const facilityCheckPromise = this.facilityModel
      .findOne({
        _id: new Types.ObjectId(facilityId),
        account: { $ne: null },
      })
      .lean()

    // Thực thi cả 2 promise cùng lúc
    const [managerHasFacility, facilityHasManager] = await Promise.all([
      managerCheckPromise,
      facilityCheckPromise,
    ])

    // Trả về `true` chỉ khi CẢ HAI điều kiện kiểm tra đều không tìm thấy xung đột
    // (tức là cả hai kết quả đều là `null`)
    return !managerHasFacility && !facilityHasManager
  }
}
