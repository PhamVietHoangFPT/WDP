import { CreateAddressDto } from '../dto/create-address.dto'
import { AddressResponseDto } from '../dto/address.response.dto'

export interface IAddressService {
  create(dto: CreateAddressDto): Promise<AddressResponseDto>
  findAll(): Promise<AddressResponseDto[]>
}
export const IAddressService = Symbol('IAddressService')
