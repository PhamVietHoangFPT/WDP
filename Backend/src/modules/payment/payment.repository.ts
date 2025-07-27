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
import * as dayjs from 'dayjs'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
;(dayjs as any).extend(customParseFormat as any)
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
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
  ) {}

  async createForServiceCase(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument> {
    const correctFormat = 'YYYYMMDDHHmmss'
    const payDate = dayjs(createPaymentHistoryDto.payDate, correctFormat)
    const dataSend = {
      ...createPaymentHistoryDto,
      payDate: payDate.isValid() ? payDate.toDate() : new Date(),
    }
    const newPayment = new this.paymentModel(dataSend)
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

  async createForCondition(
    createPaymentHistoryDto: CreatePaymentHistoryDto,
    userId: string,
    currentServiceCasePayment: string,
  ): Promise<PaymentDocument> {
    const correctFormat = 'YYYYMMDDHHmmss'
    const payDate = dayjs(createPaymentHistoryDto.payDate, correctFormat)
    const dataSend = {
      ...createPaymentHistoryDto,
      payDate: payDate.isValid() ? payDate.toDate() : new Date(),
    }
    const newPayment = new this.paymentModel(dataSend)
    const paymentType =
      await this.paymentTypeRepository.findByPaymentType('Chi phí phát sinh')
    newPayment.created_by = new mongoose.Types.ObjectId(userId) as any
    newPayment.paymentType = paymentType._id
    if (currentServiceCasePayment) {
      await this.serviceCaseRepository.updatePaymentForCondition(
        currentServiceCasePayment,
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
        .sort({ payDate: -1 }) // Sắp xếp theo ngày thanh toán mới nhất
      return query
    }
    const query = this.paymentModel
      .find({
        ...filter, // Thêm các điều kiện lọc khác nếu cần
        created_by: new Types.ObjectId(userId), // Lọc theo userId
      })
      .populate({ path: 'paymentType', select: 'paymentType' })
      .sort({ payDate: -1 }) // Sắp xếp theo ngày thanh toán mới nhất
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

  async updateStatusForKitShipment(serviceCaseId: string): Promise<any | null> {
    const serviceCase = await this.serviceCaseModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(serviceCaseId) },
      },
      {
        $lookup: {
          from: 'kitshipments',
          let: {
            caseMemberId: '$caseMember',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$caseMember', '$$caseMemberId'],
                },
              },
            },
          ],
          as: 'kitShipmentDetails',
        },
      },
      {
        $unwind: {
          path: '$kitShipmentDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          account: 1,
          kitShipmentId: '$kitShipmentDetails._id',
        },
      },
    ])
    if (!serviceCase || serviceCase.length === 0) {
      return null
    }
    return serviceCase
  }
}
