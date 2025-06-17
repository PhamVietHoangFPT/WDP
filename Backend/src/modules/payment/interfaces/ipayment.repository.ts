import { PaymentDocument } from '../schemas/payment.schema'
import { CreatePaymentHistoryDto } from '../dto/createPaymentHistory.dto'
import mongoose from 'mongoose'

export interface IPaymentRepository {
  createForBooking(
    createPaymentHistory: CreatePaymentHistoryDto,
    userId: string,
    bookingId: string,
  ): Promise<PaymentDocument>

  findById(id: string, userId?: string): Promise<PaymentDocument>

  findWithQuery(
    userId?: string,
    filter?: Record<string, unknown>,
  ): mongoose.Query<PaymentDocument[], PaymentDocument>

  countDocuments(filter: Record<string, unknown>): Promise<number>
  findWithTransactionReferenceNumber(
    transactionReferenceNumber: string,
  ): Promise<boolean>
  createForServiceCase(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument>
}

export const IPaymentRepository = Symbol('IPaymentRepository')
