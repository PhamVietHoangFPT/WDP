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
    private slot: ISlotRepository,
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
    await this.slot.setBookingStatus(createBookingDto.slot, true)
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
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    await this.slot.setBookingStatus(existingBooking.slot.toString(), false)
    await this.slot.setBookingStatus(updateBookingDto.slot, true)
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
    return await this.slot.findById(slotId)
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
}
