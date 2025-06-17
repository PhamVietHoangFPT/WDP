import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IServiceCaseService } from './interfaces/iserviceCase.service'
import { ServiceCaseResponseDto } from './dto/serviceCaseResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('service-cases')
@Controller('service-cases')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServiceCaseController {
  constructor(
    @Inject(IServiceCaseService)
    private readonly serviceCaseService: IServiceCaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service case' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  create(
    @Body() createServiceCaseDto: CreateServiceCaseDto,
    @Req() req: any,
  ): Promise<ServiceCaseResponseDto> {
    const userId = req.user.id
    return this.serviceCaseService.createServiceCase(
      createServiceCaseDto,
      userId,
    )
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả các hồ sơ dịch vụ' })
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
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài khoản.',
    type: PaginatedResponseDto<ServiceCaseResponseDto>,
  })
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Req() req: any,
  ): Promise<PaginatedResponse<ServiceCaseResponseDto>> {
    const userId = req.user.id
    return this.serviceCaseService.findAllServiceCases(
      paginationQuery.pageNumber,
      paginationQuery.pageSize,
      userId,
    )
  }

  @Patch(':id/status/:currentStatus')
  @Roles(
    RoleEnum.DELIVERY_STAFF,
    RoleEnum.DOCTOR,
    RoleEnum.SAMPLE_COLLECTOR,
    RoleEnum.STAFF,
  )
  @ApiOperation({ summary: 'Cập nhật trạng thái hiện tại của hồ sơ dịch vụ' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'ID của hồ sơ dịch vụ cần cập nhật',
  })
  @ApiParam({
    name: 'currentStatus',
    required: true,
    type: String,
    description: 'Trạng thái hiện tại mới của hồ sơ dịch vụ',
  })
  @ApiResponse({ status: 200, type: ApiResponseDto<ServiceCaseResponseDto> })
  async updateCurrentStatus(
    @Param('id') id: string,
    @Param('currentStatus') currentStatus: string,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto> | null> {
    console.log(id, currentStatus)
    const updatedServiceCase =
      await this.serviceCaseService.updateCurrentStatus(id, currentStatus)
    if (!updatedServiceCase) {
      return null
    }
    return {
      message: 'Cập nhật trạng thái hiện tại thành công',
      data: [updatedServiceCase],
      statusCode: 200,
      success: true,
    }
  }
}
