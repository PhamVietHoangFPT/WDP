import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Payment, PaymentDocument } from './schemas/payment.schema'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'
import { IBookingStatusRepository } from '../bookingStatus/interfaces/ibookingStatus.repository'
import { IPaymentTypeRepository } from '../paymentType/interfaces/ipaymentType.repository'

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @Inject(IBookingRepository)
    private bookingRepository: IBookingRepository,
    @Inject(IBookingStatusRepository)
    private bookingStatusRepository: IBookingStatusRepository,
    @Inject(IPaymentTypeRepository)
    private paymentTypeRepository: IPaymentTypeRepository,
  ) {}

  async createForBooking(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
    bookingId: string,
  ): Promise<PaymentDocument> {
    const newPayment = new this.paymentModel(createPaymentHistoryDto)
    const paymentType =
      await this.paymentTypeRepository.findByPaymentType('Đặt chỗ')
    newPayment.created_by = new mongoose.Types.ObjectId(userId) as any
    newPayment.paymentType = paymentType._id
    let bookingStatus: any = null
    if (
      createPaymentHistoryDto.transactionStatus !== '00' &&
      createPaymentHistoryDto.responseCode !== '00'
    ) {
      bookingStatus = await this.bookingStatusRepository.findByBookingStatus(
        'Thanh toán thất bại',
      )
    } else if (
      createPaymentHistoryDto.transactionStatus === '00' &&
      createPaymentHistoryDto.responseCode === '00'
    ) {
      bookingStatus =
        await this.bookingStatusRepository.findByBookingStatus('Thành công')
    }
    if (bookingId) {
      await this.bookingRepository.updatePayment(
        bookingId,
        bookingStatus,
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        newPayment._id.toString(),
      )
    }
    return await newPayment.save()
  }

  async findById(id: string, userId?: string): Promise<PaymentDocument> {
    return this.paymentModel
      .findById({
        _id: id, // Điều kiện: _id của payment phải khớp
        created_by: userId, // Điều kiện: created_by phải khớp với userId
      })
      .populate({ path: 'paymentType', select: '-_id paymentType' })
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
      const query = this.paymentModel
        .find({
          ...filter, // Thêm các điều kiện lọc khác nếu cần
        })
        .populate({ path: 'paymentType', select: 'paymentType' })
      return query
    }
    const query = this.paymentModel
      .find({
        ...filter, // Thêm các điều kiện lọc khác nếu cần
        created_by: new mongoose.Types.ObjectId(userId) as any, // Lọc theo userId
      })
      .populate({ path: 'paymentType', select: 'paymentType' })

    return query
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.paymentModel.countDocuments(filter).exec()
  }

  async findWithTransactionReferenceNumber(
    transactionReferenceNumber: string,
  ): Promise<boolean> {
    return await this.paymentModel
      .exists({ transactionReferenceNumber })
      .then((exists) => !!exists)
  }
}
