import { Inject, Injectable } from '@nestjs/common'
import { VnpayService as VnpayServiceLocal } from 'nestjs-vnpay'
import { Bank, dateFormat } from 'vnpay'
import { PaymentDataDto } from './dto/PaymentData.dto'
import { randomUUID } from 'crypto'
import { PaymentServiceCaseDto } from './dto/serviceCase.dto'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'
import { PaymentConditionCaseDto } from './dto/condition.dto'
@Injectable()
export class VnpayService {
  constructor(
    private readonly vnpayService: VnpayServiceLocal,
    @Inject(IServiceCaseRepository)
    private readonly serviceCaseRepository: IServiceCaseRepository,
  ) {}

  async getBankList(): Promise<Bank[]> {
    return this.vnpayService.getBankList()
  }

  getPaymentUrl(PaymentData: PaymentDataDto): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = 'http://localhost:5173/payment-success-any/'
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

  async getPaymentUrlForServiceCase(
    PaymentData: PaymentServiceCaseDto,
  ): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = 'http://localhost:5173/payment-success/'
    const serviceCaseFee = await this.serviceCaseRepository.getTotalFeeById(
      PaymentData.serviceCaseId,
    )
    const shippingFee = await this.serviceCaseRepository.getShippingFeeById(
      PaymentData.serviceCaseId,
    )
    const totalFee = serviceCaseFee + shippingFee
    const dataSend = {
      vnp_Amount: totalFee,
      vnp_OrderInfo: 'Thanh toán dịch vụ ' + PaymentData.serviceCaseId,
      vnp_TxnRef: PaymentData.serviceCaseId,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
      vnp_IpAddr,
      vnp_ReturnUrl,
    }
    return Promise.resolve(this.vnpayService.buildPaymentUrl(dataSend))
  }

  async getPaymentUrlForCondition(
    PaymentData: PaymentConditionCaseDto,
  ): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = 'http://localhost:5173/payment-success-condition/'
    const conditionFee = await this.serviceCaseRepository.getConditionFeeById(
      PaymentData.serviceCaseId,
    )
    const dataSend = {
      vnp_Amount: conditionFee,
      vnp_OrderInfo: 'Thanh toán dịch vụ ' + PaymentData.serviceCaseId,
      vnp_TxnRef: PaymentData.serviceCaseId,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
      vnp_IpAddr,
      vnp_ReturnUrl,
    }
    return Promise.resolve(this.vnpayService.buildPaymentUrl(dataSend))
  }

  async getPaymentUrlForServiceCaseMobile(
    PaymentData: PaymentServiceCaseDto,
  ): Promise<string> {
    const createDate = new Date()
    const expireDate = new Date(createDate.getTime() + 10 * 60 * 1000)
    const vnp_IpAddr = '192.168.1.1'
    const vnp_ReturnUrl = 'http://localhost:8081/payment-success/'
    const totalFee = await this.serviceCaseRepository.getTotalFeeById(
      PaymentData.serviceCaseId,
    )
    const dataSend = {
      vnp_Amount: totalFee,
      vnp_OrderInfo: 'Thanh toán dịch vụ ' + PaymentData.serviceCaseId,
      vnp_TxnRef: PaymentData.serviceCaseId,
      vnp_CreateDate: dateFormat(createDate),
      vnp_ExpireDate: dateFormat(expireDate),
      vnp_IpAddr,
      vnp_ReturnUrl,
    }
    return Promise.resolve(this.vnpayService.buildPaymentUrl(dataSend))
  }
}
