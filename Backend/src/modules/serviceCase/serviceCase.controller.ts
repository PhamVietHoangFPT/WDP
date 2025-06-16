import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  // ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IServiceCaseService } from './interfaces/iserviceCase.service'
import { ServiceCaseResponseDto } from './dto/serviceCaseResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import {} from '@nestjs/common'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
// import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
// import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('serviceCases')
@Controller('serviceCases')
@UseGuards(AuthGuard)
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
}
