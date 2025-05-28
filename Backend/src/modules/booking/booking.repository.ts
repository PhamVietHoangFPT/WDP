import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Booking, BookingDocument } from './schemas/booking.schema'
import { IBookingRepository } from './interfaces/ibooking.repository'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'

@Injectable()
export class BookingRepository implements IBookingRepository {
  constructor(
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingDocument> {
    const newBooking = new this.bookingModel(createBookingDto)
    return await newBooking.save()
  }

  async findById(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findById(id).exec()
  }

  async findAll(): Promise<BookingDocument[]> {
    return this.bookingModel.find().exec()
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingDocument | null> {
    return this.bookingModel
      .findByIdAndUpdate(id, updateBookingDto, { new: true })
      .exec()
  }

  async delete(id: string): Promise<BookingDocument | null> {
    return this.bookingModel.findByIdAndDelete(id).exec()
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<BookingDocument[], BookingDocument> {
    return this.bookingModel.find(filter).lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.bookingModel.countDocuments(filter).exec()
  }
}
