import { PaymentDocument } from '../schemas/payment.schema'
import { CheckVnPayPaymentDto } from '../dto/checkVnPayPayment.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaymentHistoryResponseDto } from '../dto/paymentHistoryResponse.dto'

export interface IPaymentService {
  createForCase(
    checkVnPayPayment: CheckVnPayPaymentDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument>

  createForCondition(
    checkVnPayPayment: CheckVnPayPaymentDto,
    userId: string,
    currentServiceCasePayment: string,
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
