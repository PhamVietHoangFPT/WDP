import { Injectable } from '@nestjs/common'
import { VnpayService as VnpayServiceLocal } from 'nestjs-vnpay'
import { Bank, dateFormat } from 'vnpay'
import { PaymentDataDto } from './dto/PaymentData.dto'
import { PaymentBookingDto } from './dto/paymentBooking.dto'
import { randomUUID } from 'crypto'
@Injectable()
export class VnpayService {
  constructor(private readonly vnpayService: VnpayServiceLocal) {}
  vnp_ReturnUrl = 'https://www.google.com/'

  async getBankList(): Promise<Bank[]> {
    return this.vnpayService.getBankList()
  }

  getPaymentUrl(PaymentData: PaymentDataDto): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = this.vnp_ReturnUrl
    const dataSend = {
      ...PaymentData,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
      vnp_IpAddr,
      vnp_ReturnUrl,
      vnp_TxnRef: randomUUID(), // Tạo mã giao dịch duy nhất
    }
    return Promise.resolve(this.vnpayService.buildPaymentUrl(dataSend))
  }

  getPaymentUrlForBooking(PaymentData: PaymentBookingDto): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = this.vnp_ReturnUrl
    const dataSend = {
      vnp_Amount: 100000,
      vnp_OrderInfo: 'Thanh toán đặt chỗ ' + PaymentData.bookingId,
      vnp_TxnRef: randomUUID(),
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
      vnp_IpAddr,
      vnp_ReturnUrl,
    }
    return Promise.resolve(this.vnpayService.buildPaymentUrl(dataSend))
  }
}
