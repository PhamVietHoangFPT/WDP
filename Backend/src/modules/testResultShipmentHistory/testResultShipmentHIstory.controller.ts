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
import { ITestResultShipmentHistoryService } from './interfaces/iTestResultShipmentHistory.service'
import { TestResultShipmentHistoryDocument } from './schemas/TestResultShipmentHistory.schema'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('test-result-shipment-histories')
@Controller('test-result-shipment-histories')
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles(RoleEnum.STAFF, RoleEnum.CUSTOMER)
export class TestResultShipmentHistoryController {
  constructor(
    @Inject(ITestResultShipmentHistoryService)
    private readonly testResultShipmentHistoryService: ITestResultShipmentHistoryService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy test result shipment' })
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
    description: 'ID của tài khoản để lọc kết quả vận chuyển',
  })
  @ApiQuery({
    name: 'shipperId',
    required: false,
    type: String,
    description: 'ID của shipper để lọc kết quả vận chuyển',
  })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử  kết quả vận chuyển result được lấy thành công',
    type: PaginatedResponseDto<TestResultShipmentHistoryDocument>,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('accountId') accountId: string,
    @Query('shipperId') shipperId: string,
  ): Promise<PaginatedResponse<TestResultShipmentHistoryDocument>> {
    return this.testResultShipmentHistoryService.findAllTestResultShipmentHistory(
      paginationQuery.pageNumber,
      paginationQuery.pageSize,
      accountId,
      shipperId,
    )
  }
}
