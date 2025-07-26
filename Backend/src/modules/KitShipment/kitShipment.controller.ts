import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { IKitShipmentService } from './interfaces/ikitShipment.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { CreateKitShipmentDto } from './dto/createKitShipment.dto'
import { KitShipmentResponseDto } from './dto/kitShipmentResponse.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { RolesGuard } from 'src/common/guard/roles.guard'

@ApiTags('kit-shipment')
@Controller('kit-shipment')
export class KitShipmentController {
  constructor(
    @Inject(IKitShipmentService)
    private readonly kitshipmentService: IKitShipmentService, // <-- Thay đổi cách inject
  ) { }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateKitShipmentDto })
  @ApiOperation({ summary: 'Tạo kit shipment mới' })
  create(@Body() createKitShipmentDto: CreateKitShipmentDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.kitshipmentService.createKitShipment(user, createKitShipmentDto)
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Xem tất cả kit shipment' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'currentStatus',
    required: false,
    type: String,
    description: 'Trạng thái hiện tại của kit shipment',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách kitshipment.',
    type: PaginatedResponseDto<KitShipmentResponseDto>,
  })
  @ApiResponse({ status: HttpStatus.OK, type: [KitShipmentResponseDto] })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('currentStatus') currentStatus: string | null,
    @Req() req: any,
  ): Promise<PaginatedResponse<KitShipmentResponseDto>> {
    const userId = req.user.id
    return this.kitshipmentService.findAllKitShipment(
      paginationQuery.pageNumber,
      paginationQuery.pageSize,
      currentStatus,
      userId,
    )
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tìm kit shipment' })
  @ApiResponse({ status: HttpStatus.OK, type: KitShipmentResponseDto })
  async findById(@Param('id') id: string): Promise<KitShipmentResponseDto> {
    return await this.kitshipmentService.findKitShipmentById(id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật kiểu trạng thái vận chuyển theo ID' })
  @ApiBody({ type: UpdateKitShipmentDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật vận chuyển thành công',
    type: ApiResponseDto<KitShipmentResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateKitShipmentDto: UpdateKitShipmentDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<KitShipmentResponseDto>> {
    const user = req.user.idx``
    const updatedType = await this.kitshipmentService.updateKitShipment(
      id,
      user,
      updateKitShipmentDto,
    )
    return new ApiResponseDto<KitShipmentResponseDto>({
      statusCode: 200,
      message: 'Cập nhật kiểu trạng thái vận chuyển thành công',
      data: [updatedType],
    })
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa kit shipment' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.kitshipmentService.deleteKitShipment(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa dịch vụ thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Patch(':id/status/:currentStatus')
  // @Roles(
  //   RoleEnum.DELIVERY_STAFF,
  // )
  @ApiOperation({ summary: 'Cập nhật trạng thái hiện tại của hồ sơ dịch vụ' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'ID của kitshipment cần cập nhật',
  })
  @ApiParam({
    name: 'currentStatus',
    required: true,
    type: String,
    description: 'Trạng thái hiện tại mới của hồ sơ dịch vụ',
  })
  @ApiResponse({ status: 200, type: ApiResponseDto<KitShipmentResponseDto> })
  async updateCurrentStatus(
    @Param('id') id: string,
    @Param('currentStatus') currentStatus: string,
  ): Promise<ApiResponseDto<KitShipmentResponseDto> | null> {
    const updatedKitShipment =
      await this.kitshipmentService.updateCurrentStatus(id, currentStatus)
    if (!updatedKitShipment) {
      return null
    }

    return {
      message: 'Cập nhật trạng thái hiện tại thành công',
      data: [updatedKitShipment],
      statusCode: 200,
      success: true,
    }
  }
}
