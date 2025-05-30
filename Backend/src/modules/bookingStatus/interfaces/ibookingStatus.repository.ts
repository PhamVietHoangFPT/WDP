import { BookingStatusDocument } from '../schemas/bookingStatus.schema'

export interface IBookingStatusRepository {
  getAll(): Promise<BookingStatusDocument[]>
  findById(id: string): Promise<BookingStatusDocument | null>
  findByBookingStatus(name: string): Promise<BookingStatusDocument | null>
}

export const IBookingStatusRepository = Symbol('IBookingStatusRepository')
