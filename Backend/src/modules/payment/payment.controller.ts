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
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaymentHistoryResponseDto } from './dto/paymentHistoryResponse.dto'
import { CheckVnPayPaymentDto } from './dto/checkVnPayPayment.dto'

@ApiTags('payments')
@Controller('payments')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class PaymentController {
  constructor(
    @Inject(IPaymentService)
    private readonly paymentService: IPaymentService,
  ) {}

  @Post('booking')
  @ApiOperation({ summary: 'Tạo lịch sử thanh toán cho đặt chỗ' })
  @ApiBody({ type: CheckVnPayPaymentDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Lịch sử thanh toán được tạo thành công',
  })
  createPaymentHistoryForBooking(
    @Body(ValidationPipe) CheckVnPayPaymentDto: CheckVnPayPaymentDto,
    @Req() req: any, // Assuming you might need the request object for user info
  ) {
    const userId = req.user.id
    const currentBookingPayment = req.session.currentBookingPayment
    return this.paymentService.createForBooking(
      CheckVnPayPaymentDto,
      userId,
      currentBookingPayment,
    )
  }

  // @Post('case')
  // @ApiOperation({
  //   summary: 'Tạo lịch sử thanh toán cho trường hợp xét nghiệm',
  // })
  // @ApiBody({ type: CheckVnPayPaymentDto })
  // @ApiResponse({
  //   status: HttpStatus.CREATED,
  //   description: 'Lịch sử thanh toán được tạo thành công',
  // })
  // createPaymentHistoryForCase(
  //   @Body(ValidationPipe) CheckVnPayPaymentDto: CheckVnPayPaymentDto,
  //   @Req() req: any, // Assuming you might need the request object for user info
  // ) {
  //   const userId = req.user.id

  //   return this.paymentService.createForCase(CheckVnPayPaymentDto, userId)
  // }

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
    type: ApiResponseDto<PaginatedResponse<PaymentHistoryResponseDto>>,
  })
  getPaymentHistories(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
    @Req() req: any,
  ) {
    const { pageNumber, pageSize } = paginationQuery
    const userId = req.user.id
    return this.paymentService.findAll(pageNumber || 1, pageSize || 10, userId)
  }

  @Get('staff')
  @Roles(RoleEnum.STAFF)
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
    type: ApiResponseDto<PaginatedResponse<PaymentHistoryResponseDto>>,
  })
  getPaymentHistoriesStaff(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
  ) {
    const { pageNumber, pageSize } = paginationQuery
    return this.paymentService.findAll(pageNumber || 1, pageSize || 10)
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
}
