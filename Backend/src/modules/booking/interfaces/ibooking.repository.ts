import { BookingDocument } from '../schemas/booking.schema'
import { CreateBookingDto } from '../dto/createBooking.dto'
import mongoose from 'mongoose'
import { UpdateBookingDto } from '../dto/updateBooking.dto'
import { SlotDocument } from 'src/modules/slot/schemas/slot.schema'

export interface IBookingRepository {
  create(
    createBookingDto: CreateBookingDto,
    bookingDate: Date,
    userId: string,
  ): Promise<BookingDocument>
  findById(id: string, userId: string): Promise<BookingDocument | null>
  findOnlyById(id: string): Promise<BookingDocument | null>
  findAll(userId: string): Promise<BookingDocument[]>
  update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
  ): Promise<BookingDocument | null>
  findWithQuery(
    filter: Record<string, unknown>,
    userId: string,
  ): mongoose.Query<BookingDocument[], BookingDocument>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findBySlotId(slotId: string): Promise<SlotDocument | null>
  checkExistById(id: string): Promise<boolean>
  getFacilityIdByBookingId(id: string): Promise<string | null>
  getBookingDateById(id: string): Promise<Date | null>
  getSlotIdByBookingId(id: string): Promise<string | null>
  getAllBookingsIds(): Promise<string[]>
  getAllBookingsIdByCurrentDate(currentDate: Date): Promise<any[]>
  findBookingsWithoutServiceCase(
    timeLimit: Date,
  ): Promise<{ _id: string; slot: string }[]>
}

export const IBookingRepository = Symbol('IBookingRepository')
