import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { IPaymentTypeRepository } from './interfaces/ipaymentType.repository'
import { IPaymentTypeService } from './interfaces/ipaymentType.service'
import { PaymentTypeDocument } from './schemas/paymentType.schema'

@Injectable()
export class PaymentTypeService implements IPaymentTypeService {
  constructor(
    @Inject(IPaymentTypeRepository)
    private readonly paymentTypeRepository: IPaymentTypeRepository,
  ) {}

  async getAll(): Promise<PaymentTypeDocument[]> {
    return this.paymentTypeRepository.findAll()
  }

  async findById(id: string): Promise<PaymentTypeDocument> {
    const paymentType = await this.paymentTypeRepository.findById(id)
    if (!paymentType) {
      throw new NotFoundException(`Loại thanh toán không tồn tại`)
    }
    return paymentType
  }

  async findByPaymentType(
    paymentType: string,
  ): Promise<PaymentTypeDocument | null> {
    return this.paymentTypeRepository.findByPaymentType(paymentType)
  }
}
