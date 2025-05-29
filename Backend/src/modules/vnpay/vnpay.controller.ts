import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { VnpayService } from './vnpay.service'
import { PaymentDataDto } from './dto/PaymentData.dto'
import { PaymentBookingDto } from './dto/paymentBooking.dto'

@ApiTags('vnpay')
@Controller('vnpay')
@UseInterceptors(ClassSerializerInterceptor)
export class VnpayController {
  constructor(private readonly vnpayService: VnpayService) {}
  @Get('banks')
  @ApiOperation({ summary: 'Lấy danh sách ngân hàng' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách ngân hàng',
  })
  async getBankList() {
    const bankList = await this.vnpayService.getBankList()
    return bankList
  }

  @Post('payment-url')
  @ApiOperation({ summary: 'Xây dựng URL thanh toán' })
  @ApiBody({ type: PaymentDataDto })
  @ApiResponse({
    status: 400,
    description:
      'Yêu cầu không hợp lệ, vui lòng cung cấp thông tin thanh toán đầy đủ',
  })
  @ApiResponse({
    status: 200,
    description: 'URL thanh toán được xây dựng thành công',
  })
  async getPaymentUrl(@Body() paymentDto: PaymentDataDto) {
    const paymentUrl = await this.vnpayService.getPaymentUrl(paymentDto)
    return paymentUrl
  }

  @Post('payment-for-booking')
  @ApiOperation({ summary: 'Xây dựng URL thanh toán cho đặt chỗ' })
  @ApiBody({ type: PaymentBookingDto })
  @ApiResponse({
    status: 400,
    description:
      'Yêu cầu không hợp lệ, vui lòng cung cấp thông tin thanh toán đầy đủ',
  })
  @ApiResponse({
    status: 200,
    description: 'URL thanh toán được xây dựng thành công',
  })
  async getPaymentUrlForBooking(@Body() PaymentBookingDto: PaymentBookingDto) {
    const paymentUrl =
      await this.vnpayService.getPaymentUrlForBooking(PaymentBookingDto)
    return paymentUrl
  }
}
