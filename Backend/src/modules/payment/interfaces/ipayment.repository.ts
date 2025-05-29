import { PaymentDocument } from '../schemas/payment.schema'
import { CreatePaymentHistoryDto } from '../dto/createPaymentHistory.dto'
import mongoose from 'mongoose'

export interface IPaymentRepository {
  create(
    createPaymentHistory: CreatePaymentHistoryDto,
    userId: string,
  ): Promise<PaymentDocument>

  findById(id: string, userId?: string): Promise<PaymentDocument>

  findWithQuery(
    userId?: string,
    filter?: Record<string, unknown>,
  ): mongoose.Query<PaymentDocument[], PaymentDocument>

  countDocuments(filter: Record<string, unknown>): Promise<number>
}

export const IPaymentRepository = Symbol('IPaymentRepository')
