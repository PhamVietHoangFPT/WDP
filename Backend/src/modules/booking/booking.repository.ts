import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { IBookingRepository } from './interfaces/ibooking.repository'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'
import { SlotDocument } from '../slot/schemas/slot.schema'
import { ISlotRepository } from '../slot/interfaces/islot.repository'
import { IBookingStatusRepository } from '../bookingStatus/interfaces/ibookingStatus.repository'
import { BookingStatusDocument } from '../bookingStatus/schemas/bookingStatus.schema'

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
      .populate({ path: 'account', select: 'name email phoneNumber' })
      .populate({ path: 'slot', select: 'startTime endTime' })
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

  async getAllBookingByStatus(
    isUsed: boolean,
    userId: string,
  ): Promise<BookingDocument[]> {
    const bookingStatus =
      await this.bookingStatusRepository.findByBookingStatus('Thành công')
    return this.bookingModel
      .find({
        isUsed: isUsed,
        created_by: userId,
        bookingStatus: bookingStatus,
      })
      .select('-account')
      .populate({ path: 'bookingStatus', select: 'bookingStatus -_id' })
      .populate({ path: 'slot', select: 'startTime endTime -_id' })

      .exec()
  }
}
