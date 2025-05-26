import { Booking, BookingDocument } from '../schemas/booking.schema'
import { CreateBookingDto } from '../dto/createBooking.dto'
import mongoose from 'mongoose'

export interface IBookingRepository {
  create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingDocument>
  findById(id: string): Promise<BookingDocument | null>
  findAll(): Promise<BookingDocument[]>
  update(
    id: string,
    updateBookingDto: Partial<Booking>,
  ): Promise<BookingDocument | null>
  delete(id: string, userId: string): Promise<BookingDocument | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<BookingDocument[], BookingDocument>
  countDocuments(filter: Record<string, unknown>): Promise<number>
}

export const IBookingRepository = Symbol('IBookingRepository')
