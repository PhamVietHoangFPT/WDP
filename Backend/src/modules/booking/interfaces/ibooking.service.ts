import { CreateBookingDto } from '../dto/createBooking.dto'
import { BookingResponseDto } from '../dto/bookingResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { UpdateBookingDto } from '../dto/updateBooking.dto'

export interface IBookingService {
  create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto>
  findById(id: string, userId: string): Promise<BookingResponseDto | null>
  findAll(
    pageNumber: number,
    pageSize: number,
    userId: string,
  ): Promise<PaginatedResponse<BookingResponseDto>>
  update(
    id: string,
    updateBookingDto: Partial<UpdateBookingDto>,
    userId: string,
  ): Promise<BookingResponseDto | null>
  cancel(id: string, userId: string): Promise<BookingResponseDto | null>
  setStatusIfPaymentFailed(): Promise<void>
  getAllBookingByStatus(
    isUsed: boolean,
    userId: string,
  ): Promise<BookingResponseDto[]>
}

export const IBookingService = Symbol('IBookingService')
