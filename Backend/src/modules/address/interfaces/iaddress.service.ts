import { CreateAddressDto } from '../dto/create-address.dto'
import { AddressResponseDto } from '../dto/address.response.dto'
import { UpdateAddressDto } from '../dto/updateAddress.dto' // <-- Sửa DTO này
import { UpdateFacilityAddressDto } from '../dto/updateFacilityAddress.dto' // <-- Và DTO này
import { CreateAddressFacilityDto } from '../dto/createAddressFacility.dto'

export interface IAddressService {
  create(dto: CreateAddressDto, userId: string): Promise<AddressResponseDto>
  findAll(): Promise<AddressResponseDto[]>
  createForFacility(
    dto: CreateAddressFacilityDto,
    userId: string,
  ): Promise<AddressResponseDto>
  // Sửa lại chữ ký cho hàm update: `data` giờ là DTO update (optional)
  updateAddressById(
    id: string,
    data: UpdateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto | null>
  findById(id: string): Promise<AddressResponseDto>
  // Tương tự, sửa chữ ký cho hàm update này
  updateFacilityAddress(
    id: string,
    userId: string,
    data: UpdateFacilityAddressDto,
  ): Promise<AddressResponseDto | null>
}

export const IAddressService = Symbol('IAddressService')
