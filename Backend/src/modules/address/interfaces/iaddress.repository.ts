import { Address } from '../schemas/address.schema'
import { CreateAddressDto } from '../dto/create-address.dto'

export interface IAddressRepository {
  create(data: CreateAddressDto): Promise<Address>
  findAll(): Promise<Address[]>
}
export const IAddressRepository = Symbol('IAddressRepository')
