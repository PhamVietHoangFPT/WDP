import { CreateBookingDto } from '../dto/createBooking.dto'
import { BookingResponseDto } from '../dto/bookingResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { UpdateBookingDto } from '../dto/updateBooking.dto'

export interface IBookingService {
  create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto>
  findById(id: string): Promise<BookingResponseDto | null>
  findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<BookingResponseDto>>
  update(
    id: string,
    updateBookingDto: Partial<UpdateBookingDto>,
    userId: string,
  ): Promise<BookingResponseDto | null>
  delete(id: string, userId: string): Promise<BookingResponseDto | null>
}
