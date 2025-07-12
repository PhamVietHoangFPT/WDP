import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Address, AddressDocument } from './schemas/address.schema'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { CreateAddressDto } from './dto/create-address.dto'
import { CreateAddressFacilityDto } from './dto/createAddressFacility.dto'

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async create(
    data: CreateAddressDto,
    userId: string,
  ): Promise<AddressDocument> {
    const address = new this.addressModel({
      ...data,
      created_by: userId,
    })
    return address.save()
  }

  async createForFacility(
    data: CreateAddressFacilityDto,
    userId: string,
  ): Promise<AddressDocument> {
    const address = new this.addressModel({
      ...data,
      created_by: userId,
    })
    return address.save()
  }

  async findAll(): Promise<AddressDocument[]> {
    return this.addressModel
      .find({ deleted_at: null })
      .populate({ path: 'account', select: 'name email -_id' })
      .lean()
      .exec()
  }

  async updateAddressById(
    id: string,
    data: Partial<CreateAddressDto>,
    userId: string,
  ): Promise<AddressDocument | null> {
    return this.addressModel
      .findByIdAndUpdate(
        id,
        {
          ...data,
          updated_by: userId,
          updated_at: new Date(),
        },
        { new: true },
      )
      .exec()
  }

  async findById(id: string): Promise<AddressDocument | null> {
    return this.addressModel
      .findOne({ _id: id, deleted_at: null })
      .lean()
      .exec()
  }
}
