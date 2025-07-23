/* eslint-disable @typescript-eslint/no-base-to-string */
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { FilterQuery, Model, Types, UpdateQuery } from 'mongoose'
import { ServiceCase, ServiceCaseDocument } from './schemas/serviceCase.schema'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { IServiceCaseRepository } from './interfaces/iserviceCase.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
import { ITestRequestHistoryRepository } from '../testRequestHistory/interfaces/itestRequestHistory.repository'

@Injectable()
export class ServiceCaseRepository implements IServiceCaseRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
    @Inject(ITestRequestHistoryRepository)
    private testRequestHistoryRepository: ITestRequestHistoryRepository,
  ) { }

  async getConditionFeeById(id: string): Promise<number | null> {
    type ConditionPopulated = { condition: { conditionFee?: number } }

    const serviceCase = await this.serviceCaseModel
      .findById(id)
      .populate({ path: 'condition', select: 'conditionFee' })
      .lean<ConditionPopulated>()

    return serviceCase?.condition?.conditionFee ?? null
  }

  async findOneById(id: string): Promise<ServiceCaseDocument | null> {
    return await this.serviceCaseModel
      .findOne({ _id: id, deleted_at: null })
      .exec()
  }

  async updateCondition(
    id: string,
    condition: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        condition: condition ? new mongoose.Types.ObjectId(condition) : null,
        doctor: doctorId ? new mongoose.Types.ObjectId(doctorId) : null,
      },
      { new: true },
    )
    return updatedServiceCase
  }

  findAllServiceCases(
    filter: Record<string, unknown>,
  ): mongoose.Query<ServiceCaseDocument[], ServiceCaseDocument> {
    return this.serviceCaseModel
      .find(filter)
      .sort({ created_at: -1 })
      .populate({ path: 'currentStatus', select: 'testRequestStatus -_id' })
      .lean()
  }

  async createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
    totalFee: number,
  ): Promise<ServiceCaseDocument> {
    const testRequestStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ thanh toán',
      )
    const createdServiceCase = await this.serviceCaseModel.create({
      ...createServiceCaseDto,
      created_by: userId,
      currentStatus: testRequestStatus,
      totalFee: totalFee,
      created_at: new Date(),
      shippingFee: createServiceCaseDto.shippingFee,
    })

    await this.testRequestHistoryRepository.createTestRequestHistory(
      createdServiceCase._id.toString(),
      testRequestStatus.toString(),
      userId,
    )

    return createdServiceCase
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.serviceCaseModel.countDocuments(filter).exec()
  }

  async updatePayment(
    id: string,
    currentStatus: string,
    payment: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        currentStatus: new mongoose.Types.ObjectId(currentStatus),
        payment: new mongoose.Types.ObjectId(payment),
      },
      { new: true },
    )

    await this.testRequestHistoryRepository.createTestRequestHistory(
      updatedServiceCase?._id.toString(),
      currentStatus,
      updatedServiceCase?.created_by.toString(),
    )
    return updatedServiceCase
  }

  async updatePaymentForCondition(
    id: string,
    paymentForCondition: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        paymentForCondition: new mongoose.Types.ObjectId(paymentForCondition),
      },
      { new: true },
    )
    return updatedServiceCase
  }

  async updateCurrentStatus(
    id: string,
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        currentStatus: new mongoose.Types.ObjectId(currentStatus),
        staff: staffId ? new mongoose.Types.ObjectId(staffId) : null,
        sampleCollector: sampleCollectorId
          ? new mongoose.Types.ObjectId(sampleCollectorId)
          : null,
        doctor: doctorId ? new mongoose.Types.ObjectId(doctorId) : null,
      },
      { new: true },
    )

    await this.testRequestHistoryRepository.createTestRequestHistory(
      updatedServiceCase?._id.toString(),
      currentStatus,
      updatedServiceCase?.created_by.toString(),
      staffId,
      sampleCollectorId,
      doctorId,
    )
    return updatedServiceCase
  }

  async findByCaseMemberId(caseMemberId: string): Promise<string | null> {
    const serviceCase = await this.serviceCaseModel
      .findOne({ caseMember: new mongoose.Types.ObjectId(caseMemberId) })
      .select('_id')
      .lean()
    return serviceCase ? serviceCase._id.toString() : null
  }

  async getCurrentStatusId(id: string): Promise<string | null> {
    const serviceCase = await this.serviceCaseModel
      .findById(id)
      .select('currentStatus')
      .lean()
    return serviceCase && serviceCase.currentStatus
      ? serviceCase.currentStatus.toString()
      : null
  }

  async getTotalFeeById(id: string): Promise<number | null> {
    const serviceCase = await this.serviceCaseModel
      .findById(id)
      .select('totalFee')
      .lean()
    return serviceCase ? serviceCase.totalFee : null
  }

  async updateResultId(
    id: string,
    resultId: string,
  ): Promise<ServiceCaseDocument | null> {
    return this.serviceCaseModel
      .findByIdAndUpdate(
        id,
        { result: new mongoose.Types.ObjectId(resultId) },
        { new: true },
      )
      .exec()
  }

  async getBookingIdsByTime(
    time: Date,
    currentStatusId: string,
  ): Promise<{ _id: string; bookingId: string; slotId: string }[]> {
    // ✅ 1. SỬA LẠI KIỂU DỮ LIỆU TRẢ VỀ

    const aggregationPipeline = [
      {
        $match: {
          created_at: { $lt: time },
          currentStatus: new mongoose.Types.ObjectId(currentStatusId),
        },
      },
      {
        $lookup: {
          from: 'casemembers',
          localField: 'caseMember',
          foreignField: '_id',
          as: 'caseMemberDetails',
        },
      },
      { $unwind: '$caseMemberDetails' },
      {
        $lookup: {
          from: 'bookings',
          localField: 'caseMemberDetails.booking',
          foreignField: '_id',
          as: 'bookingDetails',
        },
      },
      // Dùng $unwind an toàn hơn với preserveNullAndEmptyArrays
      // để không làm mất các service case có booking rỗng/null
      {
        $unwind: { path: '$bookingDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1, // ID của service case
          bookingId: '$bookingDetails._id',
          slotId: '$bookingDetails.slot',
        },
      },
    ]
    return this.serviceCaseModel.aggregate(aggregationPipeline)
  }

  async findByBookingId(bookingId: string): Promise<boolean> {
    // 1. Validate bookingId ngay từ đầu để tránh BSONError
    if (!Types.ObjectId.isValid(bookingId)) {
      console.warn('Invalid bookingId provided. Returning false.')
      return false // Trả về false ngay nếu ID không hợp lệ
    }

    const results = await this.serviceCaseModel.aggregate([
      {
        $lookup: {
          from: 'casemembers',
          localField: 'caseMember',
          foreignField: '_id',
          as: 'caseMemberDetails',
        },
      },
      // Nếu $unwind không có preserveNullAndEmptyArrays, nó sẽ loại bỏ các tài liệu không có caseMemberDetails
      // Điều này là hợp lý nếu bạn chỉ muốn tìm serviceCase có liên kết caseMember hợp lệ
      { $unwind: '$caseMemberDetails' },

      // THAY ĐỔI LỚN NHẤT: Lọc trực tiếp theo bookingId tại đây
      {
        $match: {
          'caseMemberDetails.booking': new Types.ObjectId(bookingId), // Sử dụng Types.ObjectId đã chuyển đổi
        },
      },

      // THAY ĐỔI ĐỂ TỐI ƯU HIỆU SUẤT: Chỉ cần tìm thấy 1 tài liệu
      { $limit: 1 },

      // THAY ĐỔI ĐỂ TỐI ƯU: Chỉ project ra _id (hoặc bất kỳ trường nhỏ nào)
      { $project: { _id: 1 } },
    ])

    // Kiểm tra xem có bất kỳ kết quả nào được trả về không
    return results.length > 0 // Trả về true nếu tìm thấy ít nhất 1 serviceCase với bookingId đó, ngược lại là false
  }

  async findByCurrentStatusId(
    currentStatusId: string,
  ): Promise<string[] | null> {
    const serviceCases = await this.serviceCaseModel
      .find({ currentStatus: new Types.ObjectId(currentStatusId) }) // Sử dụng Types.ObjectId để tránh BSONError
      .select('_id')
      .lean()
      .exec()
    return serviceCases.length > 0
      ? serviceCases.map((sc) => sc._id.toString())
      : null
  }

  async getServiceCaseCheckinTime(serviceCaseId: string): Promise<Date | null> {
    // Validate serviceCaseId ngay từ đầu để tránh BSONError
    if (!Types.ObjectId.isValid(serviceCaseId)) {
      console.warn('Invalid serviceCaseId provided. Returning null.')
      return null
    }

    const serviceCaseResults = await this.serviceCaseModel.aggregate([
      {
        $match: { _id: new Types.ObjectId(serviceCaseId) }, // Dùng Types.ObjectId nhất quán
      },
      {
        $lookup: {
          from: 'casemembers',
          let: { caseMemberId: '$caseMember' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$caseMemberId'],
                },
              },
            },
          ],
          as: 'caseMemberDetails',
        },
      },
      // Các $unwind sau $lookup nên dùng preserveNullAndEmptyArrays: true
      // nếu bạn muốn tài liệu gốc vẫn được giữ lại ngay cả khi không tìm thấy chi tiết join.
      // Nếu không, tài liệu serviceCase sẽ bị loại bỏ nếu không có caseMemberDetails hợp lệ.
      {
        $unwind: {
          path: '$caseMemberDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'bookings',
          let: { bookingId: '$caseMemberDetails.booking' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$bookingId'],
                },
              },
            },
          ],
          as: 'bookingDetails',
        },
      },
      {
        $unwind: { path: '$bookingDetails', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'slots',
          let: { slotId: '$bookingDetails.slot'.toString() },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$slotId'],
                },
              },
            },
          ],
          as: 'slotDetails',
        },
      },
      { $unwind: { path: '$slotDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          booking: '$bookingDetails.bookingDate',
          checkinDateTime: {
            $cond: {
              if: {
                $and: ['$bookingDetails.bookingDate', '$slotDetails.startTime'],
              },
              then: {
                $dateFromParts: {
                  year: { $year: '$bookingDetails.bookingDate' },
                  month: { $month: '$bookingDetails.bookingDate' },
                  day: { $dayOfMonth: '$bookingDetails.bookingDate' },
                  hour: {
                    $toInt: {
                      $arrayElemAt: [
                        { $split: ['$slotDetails.startTime', ':'] },
                        0,
                      ],
                    },
                  },
                  minute: {
                    $toInt: {
                      $arrayElemAt: [
                        { $split: ['$slotDetails.startTime', ':'] },
                        1,
                      ],
                    },
                  },
                },
              },
              else: null,
            },
          },
        },
      },
      // Giới hạn 1 kết quả vì bạn chỉ tìm theo 1 serviceCaseId
      { $limit: 1 },
    ])
    // --- SỬA LỖI Ở ĐÂY ---
    // Kiểm tra nếu có kết quả và lấy phần tử đầu tiên
    if (serviceCaseResults.length > 0) {
      // Truy cập thuộc tính checkinDateTime của phần tử đầu tiên
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return serviceCaseResults[0].checkinDateTime || null
    }
    return null // Trả về null nếu không tìm thấy serviceCase hoặc checkinDateTime là null
  }

  async getShippingFeeById(id: string): Promise<number | null> {
    return this.serviceCaseModel
      .findById(id)
      .then((serviceCase) => serviceCase?.shippingFee || null)
  }

  async checkPaidForCondition(resultId: string): Promise<boolean | null> {
    // 1. Chỉ thực hiện MỘT query duy nhất để lấy các trường cần thiết
    const serviceCase = await this.serviceCaseModel
      .findOne({
        result: new Types.ObjectId(resultId),
      })
      .select('condition paymentForCondition') // Chỉ lấy 2 trường này để tối ưu
      .lean() // .lean() giúp query nhanh hơn cho các tác vụ chỉ đọc

    // Case 1: Không tìm thấy service case nào khớp với resultId
    if (!serviceCase) {
      return null
    }

    // Case 2: Service case không có trường 'condition' -> không cần thanh toán
    if (!serviceCase.condition) {
      return false
    }

    // Case 3: Service case có 'condition', nhưng chưa có 'paymentForCondition' -> CẦN thanh toán
    if (serviceCase.condition && !serviceCase.paymentForCondition) {
      return true
    }

    // Case 4: Mặc định còn lại là có 'condition' và đã có 'paymentForCondition' -> không cần thanh toán
    return false
  }

  async updateMany(
    filter: FilterQuery<ServiceCase>,
    update: UpdateQuery<ServiceCase>,
  ): Promise<any> {
    return this.serviceCaseModel.updateMany(filter, update)
  }
}
