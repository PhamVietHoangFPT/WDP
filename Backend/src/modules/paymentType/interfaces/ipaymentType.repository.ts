import { PaymentTypeDocument } from '../schemas/paymentType.schema'

export interface IPaymentTypeRepository {
  findById(id: string): Promise<PaymentTypeDocument | null>
  findByPaymentType(paymentType: string): Promise<PaymentTypeDocument | null>
  findAll(): Promise<PaymentTypeDocument[]>
}

export const IPaymentTypeRepository = Symbol('IPaymentTypeRepository')
