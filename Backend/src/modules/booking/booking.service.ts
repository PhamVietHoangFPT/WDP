import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'

import { IBookingRepository } from './interfaces/ibooking.repository'
import { IBookingService } from './interfaces/ibooking.service'
import { CreateBookingDto } from './dto/createBooking.dto'
import { UpdateBookingDto } from './dto/updateBooking.dto'
import { BookingResponseDto } from './dto/bookingResponse.dto'
import { Booking } from './schemas/booking.schema'
import { ISlotRepository } from '../slot/interfaces/islot.repository'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import mongoose from 'mongoose'
@Injectable()
export class BookingService implements IBookingService {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: IBookingRepository,
    @Inject(ISlotRepository)
    private readonly slotRepository: ISlotRepository,
  ) {}

  private mapToResponseDto(data: any): BookingResponseDto {
    // Constructor của DTO mới sẽ tự động gán các thuộc tính khớp tên
    return new BookingResponseDto(data)
  }

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    const slotId = createBookingDto.slot
    const slot = await this.slotRepository.findById(slotId)
    if (!slot) {
      throw new NotFoundException(`Slot không tồn tại`)
    }
    if (slot.isBooked) {
      throw new BadRequestException(`Slot đã được đặt trước`)
    }

    const bookingDate = slot.slotDate

    const newBooking = await this.bookingRepository.create(
      createBookingDto,
      bookingDate,
      userId,
    )
    return this.mapToResponseDto(newBooking)
  }

  async findById(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id, userId)
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    return this.mapToResponseDto(booking)
  }

  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    userId: string,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}

    const [bookings, totalItems] = await Promise.all([
      this.bookingRepository
        .findWithQuery(filter, userId) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.bookingRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = bookings.map((booking: Booking) =>
      this.mapToResponseDto(booking),
    ) // Explicitly type `booking`
    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    const updateBookingCheck = await this.bookingRepository.findById(id, userId)
    if (!updateBookingCheck) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    const updateByUser = new mongoose.Types.ObjectId(userId)
    if (
      updateBookingCheck.updated_by &&
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      updateBookingCheck.updated_by.toString() === updateByUser.toString()
    ) {
      throw new BadRequestException(
        `Lịch hẹn chỉ được cập nhật 1 lần. Không thể cập nhật lại.`,
      )
    }
    const updatedBooking = await this.bookingRepository.update(
      id,
      updateBookingDto,
      userId,
    )
    if (!updatedBooking) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    return this.mapToResponseDto(updatedBooking)
  }
}
