import { AddressDocument } from '../schemas/address.schema'
import { CreateAddressDto } from '../dto/create-address.dto'
import { CreateAddressFacilityDto } from '../dto/createAddressFacility.dto'
import { UpdateAddressFacilityForAddressDto } from '../dto/updateFacilityAddress.dto'

export interface IAddressRepository {
  create(data: CreateAddressDto, userId: string): Promise<AddressDocument>
  findAll(): Promise<AddressDocument[]>
  createForFacility(
    data: CreateAddressFacilityDto,
    userId: string,
  ): Promise<AddressDocument>
  updateAddressById(
    id: string,
    data: Partial<CreateAddressDto>,
    userId: string,
  ): Promise<AddressDocument | null>
  findById(id: string): Promise<AddressDocument | null>
  updateFacilityAddress(
    id: string,
    userId: string,
    data: UpdateAddressFacilityForAddressDto,
  ): Promise<AddressDocument | null>
}
export const IAddressRepository = Symbol('IAddressRepository')
