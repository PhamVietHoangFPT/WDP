import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, Types } from 'mongoose'
import { Payment, PaymentDocument } from './schemas/payment.schema'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { CreatePaymentHistoryDto } from './dto/createPaymentHistory.dto'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'
import { IPaymentTypeRepository } from '../paymentType/interfaces/ipaymentType.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'

@Injectable()
export class PaymentRepository implements IPaymentRepository {
  constructor(
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @Inject(IBookingRepository)
    private bookingRepository: IBookingRepository,
    @Inject(IPaymentTypeRepository)
    private paymentTypeRepository: IPaymentTypeRepository,
    @Inject(ITestRequestStatusRepository)
    private serviceCaseStatusRepository: ITestRequestStatusRepository,
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
  ) {}

  async createForServiceCase(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument> {
    const newPayment = new this.paymentModel(createPaymentHistoryDto)
    const paymentType = await this.paymentTypeRepository.findByPaymentType(
      'Trường hợp xét nghiệm',
    )
    newPayment.created_by = new mongoose.Types.ObjectId(userId) as any
    newPayment.paymentType = paymentType._id
    let serviceCaseStatus: any = null
    if (
      createPaymentHistoryDto.transactionStatus !== '00' &&
      createPaymentHistoryDto.responseCode !== '00'
    ) {
      serviceCaseStatus =
        await this.serviceCaseStatusRepository.getTestRequestStatusIdByName(
          'Thanh toán thất bại',
        )
    } else if (
      createPaymentHistoryDto.transactionStatus === '00' &&
      createPaymentHistoryDto.responseCode === '00'
    ) {
      serviceCaseStatus =
        await this.serviceCaseStatusRepository.getTestRequestStatusIdByName(
          'Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)',
        )
    }
    if (currentServiceCasePayment) {
      await this.serviceCaseRepository.updatePayment(
        currentServiceCasePayment,
        serviceCaseStatus,
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
    console.log(userId)
    const query = this.paymentModel
      .find({
        ...filter, // Thêm các điều kiện lọc khác nếu cần
        created_by: new Types.ObjectId(userId), // Lọc theo userId
      })
      .populate({ path: 'paymentType', select: 'paymentType' })

    return query
  }

  async countDocuments(
    filter: Record<string, unknown>,
    userId?: string,
  ): Promise<number> {
    return this.paymentModel
      .countDocuments({
        ...filter,
        ...(userId ? { created_by: new Types.ObjectId(userId) } : {}),
      })
      .exec()
  }

  async findWithTransactionReferenceNumber(
    transactionReferenceNumber: string,
  ): Promise<boolean> {
    return await this.paymentModel
      .exists({ transactionReferenceNumber })
      .then((exists) => !!exists)
  }
}
