import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Payment, PaymentDocument } from './schemas/payment.schema'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}

  async create(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
  ): Promise<PaymentDocument> {
    const newPayment = new this.paymentModel(createPaymentHistoryDto)
    newPayment.created_by = new mongoose.Types.ObjectId(userId) as any
    return await newPayment.save()
  }

  async findById(id: string): Promise<PaymentDocument> {
    return this.paymentModel.findById(id).exec()
  }

  async findAll(): Promise<PaymentDocument[]> {
    return this.paymentModel.find().exec()
  }

  findWithQuery(
    userId?: string,
    filter?: Record<string, unknown>,
  ): mongoose.Query<PaymentDocument[], PaymentDocument> {
    const query = this.paymentModel.find(filter || {})
    if (userId) {
      query.where('created_by').equals(new mongoose.Types.ObjectId(userId))
    }
    return query
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.paymentModel.countDocuments(filter).exec()
  }
}
