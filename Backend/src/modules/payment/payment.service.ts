/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, Inject, ForbiddenException } from '@nestjs/common'
import { IPaymentService } from './interfaces/ipayment.service'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { CheckVnPayPaymentDto } from './dto/checkVnPayPayment.dto'
import { Payment, PaymentDocument } from './schemas/payment.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaymentHistoryResponseDto } from './dto/paymentHistoryResponse.dto'
import { transactionStatusEnum } from 'src/common/enums/transactionStatus.enum'
import { responseCodeEnum } from 'src/common/enums/responseCode.enum'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'
import { IKitShipmentRepository } from '../KitShipment/interfaces/ikitShipment.repository'
import { IKitShipmentStatusRepository } from '../kitShipmentStatus/interfaces/ikitShipmentStatus.repository'
@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
    @Inject(IKitShipmentRepository)
    private readonly kitShipmentRepository: IKitShipmentRepository,
    @Inject(IKitShipmentStatusRepository)
    private readonly kitShipmentStatusRepository: IKitShipmentStatusRepository,
  ) {}

  private mapToResponseDto(payment: Payment): PaymentHistoryResponseDto {
    const responseCode =
      responseCodeEnum[
        payment.responseCode as unknown as keyof typeof responseCodeEnum
      ]
    const transactionStatus =
      transactionStatusEnum[
        payment.transactionStatus as unknown as keyof typeof transactionStatusEnum
      ]
    return new PaymentHistoryResponseDto({
      _id: payment._id,
      tmnCode: payment.tmnCode,
      payDate: payment.payDate,
      responseCode: responseCode,
      transactionStatus: transactionStatus,
      transactionReferenceNumber: payment.transactionReferenceNumber,
      orderInfo: payment.orderInfo,
      transactionNo: payment.transactionNo,
      paymentType: payment.paymentType,
      amount: payment.amount,
    })
  }

  async createForCase(
    checkVnPayPayment: CheckVnPayPaymentDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument> {
    const paymentData: CreatePaymentHistoryDto = {
      tmnCode: checkVnPayPayment.vnp_TmnCode,
      amount: checkVnPayPayment.vnp_Amount,
      transactionStatus: checkVnPayPayment.vnp_TransactionStatus,
      responseCode: checkVnPayPayment.vnp_ResponseCode,
      payDate: checkVnPayPayment.vnp_PayDate,
      transactionReferenceNumber: checkVnPayPayment.vnp_TxnRef,
      orderInfo: checkVnPayPayment.vnp_OrderInfo,
      transactionNo: checkVnPayPayment.vnp_TransactionNo,
    }
    const existingPayment =
      await this.paymentRepository.findWithTransactionReferenceNumber(
        paymentData.transactionReferenceNumber,
      )
    if (existingPayment) {
      throw new ForbiddenException(
        'Thanh toán đã được thực hiện trước đó với mã giao dịch này.',
      )
    }
    const originalServiceCaseId = currentServiceCasePayment.split('_')[0]
    const isSelfSampling = currentServiceCasePayment.split('_')[2] === 'true'
    if (isSelfSampling) {
      const dataSend = await this.paymentRepository.updateStatusForKitShipment(
        originalServiceCaseId,
      )
      console.log(dataSend)
      const kitShipmentId = dataSend[0].kitShipmentId
      const customerId = dataSend[0].account
      let kitShipmentStatus: any = null
      if (
        paymentData.transactionStatus !== '00' &&
        paymentData.responseCode !== '00'
      ) {
        kitShipmentStatus = await this.kitShipmentStatusRepository.findByName(
          'Hủy do không thanh toán thành công',
        )
      } else if (
        paymentData.transactionStatus === '00' &&
        paymentData.responseCode === '00'
      ) {
        kitShipmentStatus = await this.kitShipmentStatusRepository.findByName(
          'Thanh toán thành công',
        )
      }
      const currentStatusId = kitShipmentStatus._id.toString()
      await this.kitShipmentRepository.updateCurrentStatus(
        kitShipmentId,
        currentStatusId,
        customerId,
      )
    }

    const payment = await this.paymentRepository.createForServiceCase(
      paymentData,
      userId,
      originalServiceCaseId,
    )
    if (!payment || typeof payment.save !== 'function') {
      throw new Error('Failed to create payment document')
    }
    return payment.save()
  }

  async createForCondition(
    checkVnPayPayment: CheckVnPayPaymentDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument> {
    const paymentData: CreatePaymentHistoryDto = {
      tmnCode: checkVnPayPayment.vnp_TmnCode,
      amount: checkVnPayPayment.vnp_Amount,
      transactionStatus: checkVnPayPayment.vnp_TransactionStatus,
      responseCode: checkVnPayPayment.vnp_ResponseCode,
      payDate: checkVnPayPayment.vnp_PayDate,
      transactionReferenceNumber: checkVnPayPayment.vnp_TxnRef,
      orderInfo: checkVnPayPayment.vnp_OrderInfo,
      transactionNo: checkVnPayPayment.vnp_TransactionNo,
    }

    const existingPayment =
      await this.paymentRepository.findWithTransactionReferenceNumber(
        paymentData.transactionReferenceNumber,
      )
    if (existingPayment) {
      throw new ForbiddenException(
        'Thanh toán đã được thực hiện trước đó với mã giao dịch này.',
      )
    }

    const originalServiceCaseId = currentServiceCasePayment.split('_')[0]
    const payment = await this.paymentRepository.createForCondition(
      paymentData,
      userId,
      originalServiceCaseId,
    )
    if (!payment || typeof payment.save !== 'function') {
      throw new Error('Failed to create payment document')
    }
    return payment.save()
  }

  async findAll(
    pageNumber: number,
    pageSize: number,
    userId?: string,
    filter?: Record<string, unknown>,
  ): Promise<PaginatedResponse<PaymentHistoryResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const [paymentHistory, totalItems] = await Promise.all([
      this.paymentRepository
        .findWithQuery(userId, filter)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.paymentRepository.countDocuments(filter, userId),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    const data = paymentHistory.map((payment: Payment) =>
      this.mapToResponseDto(payment),
    )
    return {
      data,
      pagination: {
        totalItems,
        pageSize,
        totalPages,
        currentPage: pageNumber,
      },
    }
  }

  async findById(
    id: string,
    userId?: string,
  ): Promise<PaymentHistoryResponseDto> {
    const payment = await this.paymentRepository.findById(id, userId)
    if (!payment) {
      throw new Error('Payment not found')
    }
    return this.mapToResponseDto(payment)
  }
}
