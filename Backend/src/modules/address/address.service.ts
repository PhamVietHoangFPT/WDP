import { Injectable, NotFoundException } from '@nestjs/common'
import { IAddressService } from './interfaces/iaddress.service'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { Inject } from '@nestjs/common'
import { CreateAddressDto } from './dto/create-address.dto'
import { AddressResponseDto } from './dto/address.response.dto'
import { UpdateAddressFacilityForAddressDto } from './dto/updateFacilityAddress.dto'

@Injectable()
export class AddressService implements IAddressService {
  constructor(
    @Inject(IAddressRepository)
    private readonly addressRepo: IAddressRepository,
  ) {}

  private mapToResponseDto(address: AddressResponseDto): AddressResponseDto {
    return new AddressResponseDto({
      _id: address._id,
      fullAddress: address.fullAddress,
      isKitShippingAddress: address.isKitShippingAddress,
      account: address.account,
    })
  }

  async create(
    dto: CreateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto> {
    const result = await this.addressRepo.create(dto, userId)
    return this.mapToResponseDto(result)
  }

  async findAll(): Promise<AddressResponseDto[]> {
    const data = await this.addressRepo.findAll()
    return data.map((item) => this.mapToResponseDto(item))
  }

  async createForFacility(
    dto: CreateAddressDto,
    userId: string,
  ): Promise<AddressResponseDto> {
    const result = await this.addressRepo.createForFacility(dto, userId)
    return this.mapToResponseDto(result)
  }

  async updateAddressById(
    id: string,
    data: Partial<CreateAddressDto>,
    userId: string,
  ): Promise<AddressResponseDto | null> {
    const updatedAddress = await this.addressRepo.updateAddressById(
      id,
      data,
      userId,
    )
    if (!updatedAddress) return null
    return this.mapToResponseDto(updatedAddress)
  }

  async findById(id: string): Promise<AddressResponseDto> {
    const address = await this.addressRepo.findById(id)
    if (!address) throw new NotFoundException('Không tìm thấy địa chỉ')
    return this.mapToResponseDto(address)
  }

  async updateFacilityAddress(
    id: string,
    userId: string,
    data: UpdateAddressFacilityForAddressDto,
  ): Promise<AddressResponseDto | null> {
    const updatedAddress = await this.addressRepo.updateFacilityAddress(
      id,
      userId,
      data,
    )
    if (!updatedAddress) return null
    return this.mapToResponseDto(updatedAddress)
  }
}
