import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PaymentType, PaymentTypeDocument } from './schemas/paymentType.schema'
import { IPaymentTypeRepository } from './interfaces/ipaymentType.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PaymentTypeRepository implements IPaymentTypeRepository {
  constructor(
    @InjectModel(PaymentType.name)
    private readonly paymentTypeModel: Model<PaymentTypeDocument>,
  ) {}

  async findById(id: string): Promise<PaymentTypeDocument | null> {
    return this.paymentTypeModel.findById(id).select('_id paymentType').exec()
  }

  async findByPaymentType(
    paymentType: string,
  ): Promise<PaymentTypeDocument | null> {
    return this.paymentTypeModel
      .findOne({ paymentType: paymentType })
      .select('_id')
      .exec()
  }

  async findAll(): Promise<PaymentTypeDocument[]> {
    return this.paymentTypeModel.find().select('_id paymentType').exec()
  }
}
