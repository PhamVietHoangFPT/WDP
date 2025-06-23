import { Injectable } from '@nestjs/common'
import { IAddressService } from './interfaces/iaddress.service'
import { IAddressRepository } from './interfaces/iaddress.repository'
import { Inject } from '@nestjs/common'
import { CreateAddressDto } from './dto/create-address.dto'
import { AddressResponseDto } from './dto/address.response.dto'

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
}
