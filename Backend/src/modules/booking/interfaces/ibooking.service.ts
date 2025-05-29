import { FacilityDocument } from 'src/modules/facility/schemas/facility.schema'
import { CreateBookingDto } from '../dto/createBooking.dto'
import { BookingResponseDto } from '../dto/bookingResponse.dto'

export interface IBookingService {
  create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto>
  findById(id: string): Promise<BookingResponseDto | null>
  findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<{ data: BookingResponseDto[]; total: number }>
  update(
    id: string,
    updateBookingDto: Partial<FacilityDocument>,
  ): Promise<BookingResponseDto | null>
  delete(id: string, userId: string): Promise<BookingResponseDto | null>
}
