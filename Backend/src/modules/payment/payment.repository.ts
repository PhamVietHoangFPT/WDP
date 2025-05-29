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

  async findById(id: string, userId?: string): Promise<PaymentDocument> {
    return this.paymentModel
      .findById({
        _id: id, // Điều kiện: _id của payment phải khớp
        created_by: userId, // Điều kiện: created_by phải khớp với userId
      })
      .exec()
  }

  async findAll(): Promise<PaymentDocument[]> {
    return this.paymentModel.find().exec()
  }

  findWithQuery(
    userId?: string,
    filter?: Record<string, unknown>,
  ): mongoose.Query<PaymentDocument[], PaymentDocument> {
    if (!userId) {
      const query = this.paymentModel.find({
        ...filter, // Thêm các điều kiện lọc khác nếu cần
      })
      return query
    }
    const query = this.paymentModel.find({
      ...filter, // Thêm các điều kiện lọc khác nếu cần
      created_by: new mongoose.Types.ObjectId(userId) as any, // Lọc theo userId
    })

    return query
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.paymentModel.countDocuments(filter).exec()
  }
}
