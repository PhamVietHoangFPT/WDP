import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Address, AddressDocument } from './schemas/address.schema'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { CreateAddressDto } from './dto/create-address.dto'

@Injectable()
export class AddressRepository implements IAddressRepository {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {}

  async create(data: CreateAddressDto): Promise<Address> {
    const address = new this.addressModel(data)
    return address.save()
  }

  async findAll(): Promise<Address[]> {
    return this.addressModel.find({ deleted_at: null }).exec()
  }
}
