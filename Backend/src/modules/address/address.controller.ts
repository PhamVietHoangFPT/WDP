import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Inject,
  Req,
  UseGuards,
  Put,
  Param,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'
import { IAddressService } from './interfaces/iaddress.service'
import { CreateAddressDto } from './dto/create-address.dto'
import { AddressResponseDto } from './dto/address.response.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { CreateAddressFacilityDto } from './dto/createAddressFacility.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'

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

  @Get(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của địa chỉ' })
  @ApiResponse({ status: HttpStatus.OK, type: AddressResponseDto })
  @ApiOperation({ summary: 'Lấy địa chỉ theo ID' })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<AddressResponseDto>> {
    const address = await this.addressService.findById(id)

    return {
      data: [address],
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Lấy địa chỉ thành công',
    }
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String, description: 'ID của địa chỉ' })
  @ApiBody({
    type: CreateAddressDto,
    description: 'Dữ liệu cập nhật địa chỉ',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AddressResponseDto })
  @ApiOperation({ summary: 'Cập nhật địa chỉ theo ID' })
  async updateAddressById(
    @Body() data: Partial<CreateAddressDto>,
    @Req() user: any,
    @Param('id') id: string,
  ): Promise<AddressResponseDto | null> {
    const userId = user?.id || user?._id
    return this.addressService.updateAddressById(id, data, userId)
  }
}
