import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  Inject,
  Req,
  UseGuards,
  Param,
  Patch, // <-- 1. Thay thế Put bằng Patch cho ngữ nghĩa đúng hơn
  HttpCode, // <-- 2. Import HttpCode để trả về 201 Created
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
// Không cần CreateAddressFacilityDto nữa nếu CreateAddressDto dùng chung được
// import { CreateAddressFacilityDto } from './dto/createAddressFacility.dto'
// --- 3. Import các DTO Update ---
import { UpdateAddressDto } from './dto/updateAddress.dto'
import { UpdateFacilityAddressDto } from './dto/updateFacilityAddress.dto' // Giả sử bạn có DTO này
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
  @HttpCode(HttpStatus.CREATED) // <-- 2. Trả về status 201 Created
  @ApiOperation({ summary: 'Tạo địa chỉ mới cho người dùng' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressResponseDto })
  async create(
    @Body() dto: CreateAddressDto,
    @Req() req: any, // Đổi tên `user` thành `req` cho rõ ràng hơn
  ): Promise<AddressResponseDto> {
    const userId = req.user?.id || req.user?._id
    return this.addressService.create(dto, userId)
  }

  @Post('for-facility')
  @HttpCode(HttpStatus.CREATED)
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Tạo địa chỉ cho cơ sở (Admin)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AddressResponseDto })
  async createForFacility(
    @Body() dto: CreateAddressFacilityDto, // <-- 4. Đồng nhất dùng CreateAddressDto
    @Req() req: any,
  ): Promise<AddressResponseDto> {
    const userId = req.user?.id || req.user?._id
    // Gọi đến hàm createForFacility của service
    return this.addressService.createForFacility(dto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả địa chỉ' })
  @ApiResponse({ status: HttpStatus.OK, type: [AddressResponseDto] })
  async findAll(): Promise<AddressResponseDto[]> {
    return this.addressService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy địa chỉ theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID của địa chỉ' })
  @ApiResponse({ status: HttpStatus.OK, type: AddressResponseDto })
  async findById(@Param('id') id: string): Promise<AddressResponseDto> {
    return await this.addressService.findById(id)
    // Bạn có thể trả về trực tiếp, hoặc gói trong ApiResponseDto như cũ
  }

  @Patch(':id') // <-- 1. Đổi thành PATCH
  @ApiOperation({ summary: 'Cập nhật địa chỉ cá nhân theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID của địa chỉ' })
  @ApiBody({ type: UpdateAddressDto }) // <-- 5. Dùng đúng DTO cho Swagger
  @ApiResponse({ status: HttpStatus.OK, type: AddressResponseDto })
  async updateAddressById(
    @Param('id') id: string,
    @Body() data: UpdateAddressDto, // <-- 5. Dùng đúng DTO cho validation
    @Req() req: any,
  ): Promise<AddressResponseDto | null> {
    const userId = req.user?.id || req.user?._id
    // 6. Sửa lại chữ ký hàm gọi service cho đúng với IAddressService
    return this.addressService.updateAddressById(id, data, userId)
  }

  @Patch('/facility/:id') // <-- 1. Đổi thành PATCH
  @Roles(RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Cập nhật địa chỉ cho cơ sở (Admin)' })
  @ApiParam({ name: 'id', type: String, description: 'ID của địa chỉ' })
  @ApiBody({ type: UpdateFacilityAddressDto }) // <-- 5. Dùng đúng DTO cho Swagger
  @ApiResponse({ status: HttpStatus.OK, type: AddressResponseDto })
  async updateFacilityAddress(
    @Param('id') id: string,
    @Body() data: UpdateFacilityAddressDto, // <-- 5. Dùng đúng DTO cho validation
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?._id
    // 6. Sửa lại chữ ký hàm gọi service cho đúng
    return this.addressService.updateFacilityAddress(id, userId, data)
  }
}
