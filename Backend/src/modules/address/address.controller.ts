import { Controller, Post, Body, Get, HttpStatus, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { IAddressService } from './interfaces/iaddress.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { AddressResponseDto } from './dto/address.response.dto'

@ApiTags('address')
@Controller('addresses')
export class AddressController {
  constructor(
    @Inject(IAddressService)
    private readonly addressService: IAddressService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo địa chỉ mới' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressResponseDto })
  async create(@Body() dto: CreateAddressDto): Promise<AddressResponseDto> {
    return this.addressService.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả địa chỉ' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  async findAll(): Promise<AddressResponseDto[]> {
    return this.addressService.findAll()
  }
}
