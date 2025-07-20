import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Address, AddressDocument } from './schemas/address.schema'
import {
  IAddressRepository,
  CreateCompleteAddressData,
  UpdateCompleteAddressData,
} from './interfaces/iaddress.repository'

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  // Đã đúng với interface
  async create(data: CreateCompleteAddressData): Promise<AddressDocument> {
    const newAddress = new this.addressModel(data)
    return newAddress.save()
  }

  // Đã đúng với interface
  async createForFacility(
    data: CreateCompleteAddressData,
  ): Promise<AddressDocument> {
    const newAddress = new this.addressModel(data)
    return newAddress.save()
  }

  // Đã đúng với interface
  async updateAddressById(
    id: string,
    data: UpdateCompleteAddressData,
  ): Promise<AddressDocument | null> {
    return this.addressModel.findByIdAndUpdate(id, data, { new: true }).exec()
  }

  // Đã đúng với interface
  async updateFacilityAddress(
    id: string,
    data: UpdateCompleteAddressData,
  ): Promise<AddressDocument | null> {
    return this.addressModel.findByIdAndUpdate(id, data, { new: true }).exec()
  }

  // Các hàm không thay đổi, đã đúng
  async findAll(): Promise<AddressDocument[]> {
    return this.addressModel
      .find({ deleted_at: null })
      .populate({ path: 'account', select: 'name email -_id' })
      .lean()
      .exec()
  }
  async findById(id: string): Promise<AddressDocument | null> {
    return this.addressModel
      .findOne({ _id: id, deleted_at: null })
      .lean()
      .exec()
  }
}
