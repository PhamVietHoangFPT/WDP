/* eslint-disable @typescript-eslint/no-base-to-string */
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { IBookingRepository } from './interfaces/ibooking.repository'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'
import { SlotDocument } from '../slot/schemas/slot.schema'
import { ISlotRepository } from '../slot/interfaces/islot.repository'

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
    @Inject(ISlotRepository)
    private slotRepository: ISlotRepository,
  ) { }

  async create(
    createBookingDto: CreateBookingDto,
    bookingDate: Date,
    userId: string,
  ): Promise<BookingDocument> {
    const newBooking = new this.bookingModel({
      ...createBookingDto,
      bookingDate,
      created_by: userId,
    })
    await this.slotRepository.setBookingStatus(createBookingDto.slot, true)
    return await newBooking.save()
  }

  async findById(id: string, userId: string): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOne({ _id: id, account: userId })
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({ path: 'slot', select: 'startTime endTime' })
      .exec()
  }
  async findOnlyById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel
      .findOne({ _id: id })
      .exec()
  }
  async findAll(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ account: userId })
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({ path: 'slot', select: 'startTime endTime' })
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

  async getSlotIdByBookingId(id: string): Promise<string | null> {
    const booking = await this.bookingModel
      .findById(id)
      // Populate chỉ lấy trường _id từ collection 'slot' để tối ưu hiệu suất
      .populate<{ slot: { _id: any } | null }>({ path: 'slot', select: '_id' })
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return booking?.slot?._id?.toString() ?? null
  }

  async getAllBookingsIds(): Promise<string[]> {
    const bookings = await this.bookingModel.find().exec()
    return bookings.map((booking) => booking._id.toString())
  }

  async getAllBookingsIdByCurrentDate(currentDate: Date): Promise<any[]> {
    const startOfToday = new Date(currentDate)
    startOfToday.setHours(0, 0, 0, 0) // Đặt giờ, phút, giây, mili giây về 0
    // --- KẾT THÚC CHUẨN HÓA ---

    // Tính toán đầu ngày mai và đầu ngày kia DỰA TRÊN startOfToday
    const startOfTomorrow = new Date(startOfToday.getTime() + 86400000) // 1 ngày sau startOfToday
    const startOfNextDay = new Date(startOfToday.getTime() + 2 * 86400000) // 2 ngày sau startOfToday
    const bookings = await this.bookingModel
      .find({
        bookingDate: {
          $gte: startOfTomorrow, // Bắt đầu từ 00:00:00.000Z của ngày mai
          $lt: startOfNextDay, // Đến trước 00:00:00.000Z của ngày kia
        },
      })
      .select('_id account')
      .lean()
      .exec()
    return bookings.map((booking) => {
      return {
        _id: booking._id.toString(),
        accountId: booking.account.toString(), // <-- Nếu booking.account là ObjectId
      }
    })
  }

  async findBookingsWithoutServiceCase(
    timeLimit: Date,
  ): Promise<{ _id: string; slot: string }[]> {
    return this.bookingModel.aggregate([
      // Giai đoạn 1: Chỉ lấy các booking được tạo TRƯỚC một mốc thời gian
      // Để cho người dùng có đủ thời gian hoàn thành tạo service case
      {
        $match: {
          created_at: { $lt: timeLimit },
        },
      },
      // Giai đoạn 2: "Thử" join với collection 'servicecases'
      {
        $lookup: {
          from: 'servicecases', // Tên collection của service case
          localField: '_id', // Khóa của collection 'bookings'
          foreignField: 'booking', // Khóa ngoại trong 'servicecases' trỏ về booking
          as: 'serviceCaseLink', // Tên mảng kết quả tạm thời
        },
      },
      // Giai đoạn 3: Lọc ra những document mà mảng join được RỖNG
      // Tức là không tìm thấy service case nào tương ứng
      {
        $match: {
          serviceCaseLink: { $size: 0 },
        },
      },
      // Giai đoạn 4: Chỉ lấy những trường cần thiết để xử lý
      {
        $project: {
          _id: 1, // Lấy ID của booking
          slot: 1, // Lấy ID của slot liên quan
        },
      },
    ])
  }
}
