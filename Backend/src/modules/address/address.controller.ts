import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Inject,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { IAddressService } from './interfaces/iaddress.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { AddressResponseDto } from './dto/address.response.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { CreateAddressFacilityDto } from './dto/createAddressFacility.dto'

@ApiTags('address')
@Controller('addresses')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class AddressController {
  constructor(
    @Inject(IAddressService)
    private readonly addressService: IAddressService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo địa chỉ mới' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressResponseDto })
  async create(
    @Body() dto: CreateAddressDto,
    @Req() user: any,
  ): Promise<AddressResponseDto> {
    const userId = user?.id || user?._id
    return this.addressService.create(dto, userId)
  }

  @Post('for-facility')
  @ApiOperation({ summary: 'Tạo địa chỉ cho cơ sở' })
  @Roles(RoleEnum.ADMIN)
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressResponseDto })
  async createForFacility(
    @Body() dto: CreateAddressFacilityDto,
    @Req() user: any,
  ): Promise<AddressResponseDto> {
    const userId = user?.id || user?._id
    return this.addressService.createForFacility(dto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả địa chỉ' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  async findAll(): Promise<AddressResponseDto[]> {
    return this.addressService.findAll()
  }
}
