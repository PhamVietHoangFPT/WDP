import { BookingStatusDocument } from '../schemas/bookingStatus.schema'
export interface IBookingStatusService {
  getAll(): Promise<BookingStatusDocument[]>
  findById(id: string): Promise<BookingStatusDocument | null>
  findByBookingStatus(name: string): Promise<BookingStatusDocument | null>
}

export const IBookingStatusService = Symbol('IBookingStatusService')
