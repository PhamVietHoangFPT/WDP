import { BookingDocument } from '../schemas/booking.schema'
import { CreateBookingDto } from '../dto/createBooking.dto'
import mongoose from 'mongoose'
import { UpdateBookingDto } from '../dto/updateBooking.dto'
import { SlotDocument } from 'src/modules/slot/schemas/slot.schema'

export interface IBookingRepository {
  create(
    createBookingDto: CreateBookingDto,
    userId: string,
    bookingDate: any,
  ): Promise<BookingDocument>
  findById(id: string): Promise<BookingDocument | null>
  findAll(): Promise<BookingDocument[]>
  update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingDocument | null>
  delete(id: string, userId: string): Promise<BookingDocument | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<BookingDocument[], BookingDocument>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findBySlotId(slotId: string): Promise<SlotDocument | null>
}

export const IBookingRepository = Symbol('IBookingRepository')
