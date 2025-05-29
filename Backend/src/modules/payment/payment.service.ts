import { Injectable, Inject } from '@nestjs/common'

import { IPaymentService } from './interfaces/ipayment.service'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'
import { Payment, PaymentDocument } from './schemas/payment.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaymentHistoryResponseDto } from './dto/paymentHistoryResponse.dto'
import { paymentStatusEnum } from 'src/common/enums/paymentStatus.enum'
@Injectable()
export class PaymentService implements IPaymentService {
  constructor(
    @Inject(IPaymentRepository)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  private mapToResponseDto(payment: Payment): PaymentHistoryResponseDto {
    const statusDescription =
      paymentStatusEnum[
        payment.paymentStatus as unknown as keyof typeof paymentStatusEnum
      ]
    return new PaymentHistoryResponseDto({
      _id: payment._id,
      transactionId: payment.transactionId,
      payDate: payment.payDate,
      paymentStatus: statusDescription,
    })
  }

  async create(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.create(
      createPaymentHistoryDto,
      userId,
    )
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
      this.paymentRepository.countDocuments(filter),
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
