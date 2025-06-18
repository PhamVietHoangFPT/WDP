import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, Types } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { IBookingRepository } from './interfaces/ibooking.repository'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'
import { SlotDocument } from '../slot/schemas/slot.schema'
import { ISlotRepository } from '../slot/interfaces/islot.repository'
import { IBookingStatusRepository } from '../bookingStatus/interfaces/ibookingStatus.repository'
import { BookingStatusDocument } from '../bookingStatus/schemas/bookingStatus.schema'
import { populate } from 'dotenv'

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
    @Inject(ISlotRepository)
    private slotRepository: ISlotRepository,
    @Inject(IBookingStatusRepository)
    private bookingStatusRepository: IBookingStatusRepository,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    bookingDate: Date,
    userId: string,
  ): Promise<BookingDocument> {
    const bookingStatus =
      await this.bookingStatusRepository.findByBookingStatus('Chờ thanh toán')

    const newBooking = new this.bookingModel({
      ...createBookingDto,
      bookingDate,
      created_by: userId,
      bookingStatus: bookingStatus,
    })
    await this.slotRepository.setBookingStatus(createBookingDto.slot, true)
    return await newBooking.save()
  }

  async findById(id: string, userId: string): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOne({ _id: id, account: userId })
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({ path: 'slot', select: 'startTime endTime' })
      .populate({ path: 'bookingStatus', select: 'bookingStatus -_id' })
      .exec()
  }

  async getBookingStatusById(
    id: string,
  ): Promise<BookingStatusDocument | null> {
    const booking = await this.bookingModel.findById(id).select('bookingStatus')
    const bookingStatus = await this.bookingStatusRepository.findById(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      booking.bookingStatus.toString(),
    )
    return bookingStatus
  }

  async findAll(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ account: userId })
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({ path: 'slot', select: 'startTime endTime' })
      .populate({ path: 'bookingStatus', select: 'bookingStatus -_id' })
      .exec()
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
  ): Promise<BookingDocument | null> {
    const existingBooking = await this.bookingModel.findOne({
      _id: id,
    })
    await this.slotRepository.setBookingStatus(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      existingBooking.slot.toString(),
      false,
    )
    await this.slotRepository.setBookingStatus(updateBookingDto.slot, true)
    return this.bookingModel
      .findOneAndUpdate(
        { _id: id, created_by: userId },
        {
          ...updateBookingDto,
          updated_by: userId,
          updated_at: new Date(),
        },
        {
          new: true,
        },
      )
      .exec()
  }

  async cancel(id: string, userId: string): Promise<BookingDocument | null> {
    const bookingStatus =
      await this.bookingStatusRepository.findByBookingStatus('Đã hủy')
    return this.bookingModel
      .findOneAndUpdate(
        { _id: id, created_by: userId },
        {
          updated_by: userId,
          updated_at: new Date(),
          bookingStatus: bookingStatus,
        },
        { new: true },
      )
      .exec()
  }

  findWithQuery(
    filter: Record<string, unknown>,
    userId: string,
  ): mongoose.Query<BookingDocument[], BookingDocument> {
    return this.bookingModel
      .find({ ...filter, created_by: userId })
      .select(
        '-__v -created_by -updated_by -created_at -updated_at -deleted_at -deleted_by',
      )
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({
        path: 'slot',
        select: 'startTime endTime',
        populate: {
          path: 'slotTemplate',
          select: 'facility',
          populate: {
            path: 'facility',
            select: 'facilityName address',
            populate: { path: 'address', select: 'fullAddress' },
          },
        },
      })
      .populate({ path: 'bookingStatus', select: 'bookingStatus -_id' })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.bookingModel.countDocuments(filter).exec()
  }

  async findBySlotId(slotId: string): Promise<SlotDocument | null> {
    return await this.slotRepository.findById(slotId)
  }

  async updatePayment(
    id: string,
    bookingStatus: string,
    payment: string,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOneAndUpdate(
        { _id: id },
        { bookingStatus, payment, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async checkExistById(id: string): Promise<boolean> {
    const count = await this.bookingModel.countDocuments({ _id: id }).exec()
    return count > 0
  }

  async getFacilityIdByBookingId(id: string): Promise<string | null> {
    const booking = await this.bookingModel
      .findById(id)
      .populate<{
        slot: {
          slotTemplate: {
            facility: any
          }
        }
      }>({
        path: 'slot',
        populate: {
          path: 'slotTemplate',
          select: 'facility',
        },
      })
      .lean()
      .exec()

    const facilityId = booking?.slot?.slotTemplate?.facility
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return facilityId ? facilityId.toString() : null
  }

  async getBookingDateById(id: string): Promise<Date | null> {
    const booking = await this.bookingModel
      .findById(id)
      .select('bookingDate')
      .exec()
    return booking ? booking.bookingDate : null
  }

  async updateSlotStatusIfPaymentFailed(currentTime: Date): Promise<void> {
    const bookingStatus =
      await this.bookingStatusRepository.findByBookingStatus('Chờ thanh toán')
    const failedBookings = await this.bookingModel
      .find({
        bookingStatus: bookingStatus,
        created_at: { $lt: new Date(currentTime.getTime() + 10 * 60 * 1000) }, // 10 minutes before current time
      })
      .select('slot')

    for (const booking of failedBookings) {
      if (booking.slot) {
        await this.slotRepository.setBookingStatus(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          booking.slot.toString(),
          false,
        )
        const newBookingStatus =
          await this.bookingStatusRepository.findByBookingStatus(
            'Hủy do quá hạn thanh toán',
          )
        await this.bookingModel.updateOne(
          { _id: booking._id },
          {
            bookingStatus: newBookingStatus,
            updated_at: new Date(),
          },
        )
      }
    }

    const bookingStatusPaymentFailed =
      await this.bookingStatusRepository.findByBookingStatus(
        'Thanh toán thất bại',
      )
    const paymentFailedBookings = await this.bookingModel
      .find({
        bookingStatus: bookingStatusPaymentFailed,
        created_at: { $lt: new Date(currentTime.getTime() + 10 * 60 * 1000) }, // 10 minutes before current time
      })
      .select('slot')
    for (const booking of paymentFailedBookings) {
      if (booking.slot) {
        await this.slotRepository.setBookingStatus(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          booking.slot.toString(),
          false,
        )
        const newBookingStatus =
          await this.bookingStatusRepository.findByBookingStatus(
            'Hủy do quá hạn thanh toán',
          )
        await this.bookingModel.updateOne(
          { _id: booking._id },
          {
            bookingStatus: newBookingStatus,
            updated_at: new Date(),
          },
        )
      }
    }
  }

  async updateBookingStatusToUsed(
    bookingId: string,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOneAndUpdate(
        { _id: bookingId },
        { isUsed: true, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async getAllBookingByStatus(isUsed: boolean, userId: string): Promise<any[]> {
    // <-- Sửa 3: Đổi kiểu dữ liệu trả về thành any[] hoặc DTO

    // Lấy object bookingStatus
    const bookingStatusDoc =
      await this.bookingStatusRepository.findByBookingStatus('Thành công')

    // Nếu không tìm thấy status "Thành công", trả về mảng rỗng để tránh lỗi
    if (!bookingStatusDoc) {
      return []
    }

    // Chuyển đổi userId từ string sang ObjectId để so sánh
    const userObjectId = new Types.ObjectId(userId)

    return this.bookingModel
      .aggregate([
        // --- Giai đoạn 1: Lọc các booking ban đầu (đã sửa) ---
        {
          $match: {
            isUsed: isUsed,
            created_by: userObjectId, // <-- Sửa 1: Dùng ObjectId của user
            bookingStatus: bookingStatusDoc._id, // <-- Sửa 2: Dùng _id của status
          },
        },

        // --- Giai đoạn 2: Nối bảng để lấy thông tin chi tiết (giữ nguyên) ---
        {
          $lookup: {
            from: 'bookingstatuses',
            localField: 'bookingStatus',
            foreignField: '_id',
            as: 'bookingStatusInfo',
          },
        },
        {
          $unwind: {
            path: '$bookingStatusInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        // ... các giai đoạn lookup và unwind còn lại giữ nguyên ...
        {
          $lookup: {
            from: 'slots',
            localField: 'slot',
            foreignField: '_id',
            as: 'slotInfo',
          },
        },
        { $unwind: { path: '$slotInfo', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'slottemplates',
            localField: 'slotInfo.slotTemplate',
            foreignField: '_id',
            as: 'slotTemplateInfo',
          },
        },
        {
          $unwind: {
            path: '$slotTemplateInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'facilities',
            localField: 'slotTemplateInfo.facility',
            foreignField: '_id',
            as: 'facilityInfo',
          },
        },
        {
          $unwind: {
            path: '$facilityInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: 'addresses',
            localField: 'facilityInfo.address', // Lấy ID địa chỉ từ facility
            foreignField: '_id',
            as: 'addressInfo', // Đặt tên cho kết quả nối
          },
        },
        {
          $unwind: {
            path: '$addressInfo',
            preserveNullAndEmptyArrays: true,
          },
        },
        // --- Giai đoạn 4: Định hình kết quả trả về (giữ nguyên) ---
        {
          $project: {
            _id: 1,
            isUsed: 1,
            bookingDate: 1,
            createdAt: '$created_at',
            status: '$bookingStatusInfo.bookingStatus',
            slot: {
              startTime: '$slotInfo.startTime',
              endTime: '$slotInfo.endTime',
            },
            facility: {
              _id: '$facilityInfo._id',
              facilityName: '$facilityInfo.facilityName',
              // Sửa lại dòng này để lấy chuỗi địa chỉ
              address: '$addressInfo.fullAddress', // Quan trọng: Đổi tên trường địa chỉ nếu cần
            },
          },
        },
      ])
      .exec()
  }
}
