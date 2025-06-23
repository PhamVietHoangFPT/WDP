import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { Request } from 'express'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { VnpayService } from './vnpay.service'
import { PaymentDataDto } from './dto/PaymentData.dto'
import { PaymentServiceCaseDto } from './dto/serviceCase.dto'
@ApiTags('vnpay')
@Controller('vnpay')
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

  @Post('payment-for-service-case')
  @ApiOperation({ summary: 'Xây dựng URL thanh toán cho dịch vụ' })
  @ApiBody({ type: PaymentServiceCaseDto })
  @ApiResponse({
    status: 400,
    description:
      'Yêu cầu không hợp lệ, vui lòng cung cấp thông tin thanh toán đầy đủ',
  })
  @ApiResponse({
    status: 200,
    description: 'URL thanh toán được xây dựng thành công',
  })
  async getPaymentUrlForServiceCase(
    @Body() PaymentServiceCaseDto: PaymentServiceCaseDto,
    @Req() req: Request,
  ) {
    req.session.currentServiceCasePayment = PaymentServiceCaseDto.serviceCaseId
    const paymentUrl = await this.vnpayService.getPaymentUrlForServiceCase(
      PaymentServiceCaseDto,
    )
    return { redirectUrl: paymentUrl }
  }
}
