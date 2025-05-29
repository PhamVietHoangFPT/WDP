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

  async create(dto: CreateAddressDto): Promise<AddressResponseDto> {
    const result = await this.addressRepo.create(dto)
    return new AddressResponseDto(result)
  }

  async findAll(): Promise<AddressResponseDto[]> {
    const data = await this.addressRepo.findAll()
    return data.map((item) => new AddressResponseDto(item))
  }
}
