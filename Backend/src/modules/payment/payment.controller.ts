import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common'

// import { IPaymentService } from './interfaces/ipayment.service'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { IPaymentService } from './interfaces/ipayment.service'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaymentDocument } from './schemas/payment.schema'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    @Inject(IPaymentService)
    private readonly paymentService: IPaymentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo lịch sử thanh toán' })
  @ApiBody({ type: CreatePaymentHistoryDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lịch sử thanh toán được tạo thành công',
  })
  createPaymentHistory(
    @Body(ValidationPipe) createPaymentHistoryDto: CreatePaymentHistoryDto,
    @Req() req: any, // Assuming you might need the request object for user info
  ) {
    const userId = req.user.id

    return this.paymentService.create(createPaymentHistoryDto, userId)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách lịch sử thanh toán' })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách lịch sử thanh toán được lấy thành công',
    type: ApiResponseDto<PaginatedResponse<PaymentDocument>>,
  })
  getPaymentHistories(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    @Req()
    req: any,
    paginationQuery: PaginationQueryDto,
  ) {
    const { pageNumber, pageSize } = paginationQuery
    const userId = req.user.id
    const paymentHistory = this.paymentService.findAll(
      pageNumber || 1,
      pageSize || 10,
      userId,
    )
    return {
      data: paymentHistory,
      success: true,
      message: 'Danh sách lịch sử thanh toán được lấy thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin lịch sử thanh toán theo ID' })
  @ApiParam({ name: 'id', description: 'ID của lịch sử thanh toán' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lịch sử thanh toán được lấy thành công',
  })
  getPaymentHistoryById(
    @Param('id') id: string,
    @Req() req: any, // Assuming you might need the request object for user info
  ) {
    const userId = req.user.id
    return this.paymentService.findById(id, userId)
  }

  @Get('staff')
  @Roles(RoleEnum.STAFF)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách lịch sử thanh toán được lấy thành công',
  })
  getPaymentHistoriesStaff() {
    // return this.paymentService.findAll();
    return { message: 'List of payment histories retrieved successfully' }
  }
}
