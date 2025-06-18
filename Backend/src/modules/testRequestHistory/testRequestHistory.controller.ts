import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { ITestRequestHistoryService } from './interfaces/itestRequestHistory.service'
import { TestRequestHistoryDocument } from './schemas/testRequestHistory.schema'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('testRequestHistories')
@Controller('testRequestHistories')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(RoleEnum.STAFF, RoleEnum.CUSTOMER)
export class TestRequestHistoryController {
  constructor(
    @Inject(ITestRequestHistoryService)
    private readonly testRequestHistoryService: ITestRequestHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả lịch sử xét nghiệm ADN' })
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
    name: 'accountId',
    required: true,
    type: String,
    description: 'ID của tài khoản để lọc lịch sử xét nghiệm',
  })
  @ApiQuery({
    name: 'serviceCaseId',
    required: true,
    type: String,
    description: 'ID của trường hợp dịch vụ để lọc lịch sử xét nghiệm',
  })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử xét nghiệm adn được lấy thành công',
    type: PaginatedResponseDto<TestRequestHistoryDocument>,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('accountId') accountId: string,
    @Query('serviceCaseId') serviceCaseId: string,
  ): Promise<PaginatedResponse<TestRequestHistoryDocument>> {
    return this.testRequestHistoryService.findAllTestRequestHistory(
      paginationQuery.pageNumber,
      paginationQuery.pageSize,
      accountId,
      serviceCaseId,
    )
  }
}
