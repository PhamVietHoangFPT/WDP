import { CreateAddressDto } from '../dto/create-address.dto'
import { AddressResponseDto } from '../dto/address.response.dto'
import { UpdateAddressFacilityForAddressDto } from '../dto/updateFacilityAddress.dto'

export interface IAddressService {
  create(dto: CreateAddressDto, userId: string): Promise<AddressResponseDto>
  findAll(): Promise<AddressResponseDto[]>
  createForFacility(
    dto: CreateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto>
  updateAddressById(
    id: string,
    data: Partial<CreateAddressDto>,
    userId: string,
  ): Promise<AddressResponseDto | null>
  findById(id: string): Promise<AddressResponseDto>
  updateFacilityAddress(
    id: string,
    userId: string,
    data: UpdateAddressFacilityForAddressDto,
  ): Promise<AddressResponseDto | null>
}
export const IAddressService = Symbol('IAddressService')
