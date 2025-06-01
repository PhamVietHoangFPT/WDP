import { PaymentTypeDocument } from '../schemas/paymentType.schema'

export interface IPaymentTypeService {
  getAll(): Promise<PaymentTypeDocument[]>
  findById(id: string): Promise<PaymentTypeDocument | null>
  findByPaymentType(paymentType: string): Promise<PaymentTypeDocument | null>
}

export const IPaymentTypeService = Symbol('IPaymentTypeService')
