import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Inject,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IKitShipmentStatusService } from './interfaces/ikitShipmentStatus.service'
import { KitShipmentStatusResponseDto } from './dto/KitShipmentStatusResponse.dto'
import { CreateKitShipmentStatusDto } from './dto/createKitShipmentStatus.dto'
import { UpdateKitShipmentStatusDto } from './dto/updateKitShipmentStatus.dto'
@ApiTags('kit-shipment-status')
@Controller('kit-shipment-status')
export class KitShipmentStatusController {
  constructor(
    @Inject(IKitShipmentStatusService)
    private readonly kitShipmentStatusService: IKitShipmentStatusService, // Inject the service
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tao mới kiểu trạng thái vận chuyển' })
  @ApiResponse({
    status: 201,
    description: 'Trạng thái vận chuyển đã được tạo thành công',
    type: ApiResponseDto<KitShipmentStatusResponseDto>,
  })
  @ApiBody({ type: CreateKitShipmentStatusDto })
  async create(
    @Body() createKitShipmentStatusDto: CreateKitShipmentStatusDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<KitShipmentStatusResponseDto>> {
    const user = req.user.id
    const type = await this.kitShipmentStatusService.create(
      createKitShipmentStatusDto,
      user,
    )
    return new ApiResponseDto<KitShipmentStatusResponseDto>({
      statusCode: 201,
      message: 'Trạng thái vận chuyển đã được tạo thành công',
      data: [type],
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả kiểu trạng thái vận chuyển' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả kiểu trạng thái vận chuyển',
    type: ApiResponseDto<KitShipmentStatusResponseDto>,
  })
  async findAll(): Promise<ApiResponseDto<KitShipmentStatusResponseDto>> {
    const types = await this.kitShipmentStatusService.findAll()
    return new ApiResponseDto<KitShipmentStatusResponseDto>({
      statusCode: 200,
      message: 'Danh sách tất cả kiểu trạng thái vận chuyển',
      data: types,
    })
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật kiểu trạng thái vận chuyển theo ID' })
  @ApiBody({ type: UpdateKitShipmentStatusDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật kiểu trạng thái vận chuyển thành công',
    type: ApiResponseDto<KitShipmentStatusResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateKitShipmentStatusDto: UpdateKitShipmentStatusDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<KitShipmentStatusResponseDto>> {
    const user = req.user.id
    const updatedType = await this.kitShipmentStatusService.update(
      id,
      updateKitShipmentStatusDto,
      user,
    )
    return new ApiResponseDto<KitShipmentStatusResponseDto>({
      statusCode: 200,
      message: 'Cập nhật kiểu trạng thái vận chuyển thành công',
      data: [updatedType],
    })
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa kiểu trạng thái vận chuyển theo ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 204,
    description: 'Xóa kiểu trạng thái vận chuyển thành công',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<null>> {
    const user = req.user.id
    await this.kitShipmentStatusService.delete(id, user)
    return new ApiResponseDto<null>({
      statusCode: 204,
      message: 'Xóa kiểu trạng thái vận chuyển thành công',
      data: null,
    })
  }
}
