import { CreateAddressDto } from '../dto/create-address.dto'
import { AddressResponseDto } from '../dto/address.response.dto'

export interface IAddressService {
  create(dto: CreateAddressDto, userId: string): Promise<AddressResponseDto>
  findAll(): Promise<AddressResponseDto[]>
  createForFacility(
    dto: CreateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto>
}
export const IAddressService = Symbol('IAddressService')
