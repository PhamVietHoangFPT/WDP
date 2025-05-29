import { PaymentDocument } from '../schemas/payment.schema'
import { CreatePaymentHistoryDto } from '../dto/createPaymentHistory.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaymentHistoryResponseDto } from '../dto/paymentHistoryResponse.dto'

export interface IPaymentService {
  create(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
  ): Promise<PaymentDocument>
  findById(
    id: string,
    userId?: string,
  ): Promise<PaymentHistoryResponseDto | null>
  findAll(
    pageNumber: number,
    pageSize: number,
    userId?: string,
    filter?: Record<string, unknown>,
  ): Promise<PaginatedResponse<PaymentHistoryResponseDto>>
}

export const IPaymentService = Symbol('IPaymentService')
