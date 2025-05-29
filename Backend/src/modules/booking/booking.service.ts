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

  private mapToResponseDto(booking: Booking): BookingResponseDto {
    return new BookingResponseDto({
      _id: booking._id,
      slot: booking.slot,
      account: booking.account,
      bookingStatus: booking.bookingStatus,
      bookingDate: booking.bookingDate,
    })
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

    const newBooking = await this.bookingRepository.create(
      createBookingDto,
      userId,
      slot.slotDate,
    )
    return this.mapToResponseDto(newBooking)
  }

  async findById(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findById(id)
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    return this.mapToResponseDto(booking)
  }

  async findAll(
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<PaginatedResponse<BookingResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}

    const [bookings, totalItems] = await Promise.all([
      this.bookingRepository
        .findWithQuery(filter) // Returns a query object
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
    const updateBookingCheck = await this.bookingRepository.findById(id)
    if (!updateBookingCheck) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    // if (updateBookingCheck.bookingStatus === false) {
    //   throw new BadRequestException(
    //     `Lịch hẹn đã bị hủy. Không thể cập nhật lại.`,
    //   )
    // }
    const updateByUser = new mongoose.Schema.Types.ObjectId(userId)
    if (updateBookingCheck.updated_by === updateByUser) {
      throw new BadRequestException(
        `Lịch hẹn đã được cập nhật. Không thể cập nhật lại.`,
      )
    }
    const updatedBooking = await this.bookingRepository.update(
      id,
      updateBookingDto,
    )
    if (!updatedBooking) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    return this.mapToResponseDto(updatedBooking)
  }

  async delete(id: string, userId: string): Promise<BookingResponseDto> {
    const deletedBooking = await this.bookingRepository.delete(id, userId)
    if (!deletedBooking) {
      throw new NotFoundException(`Không tìm thấy lịch hẹn với ID ${id}.`)
    }
    return this.mapToResponseDto(deletedBooking)
  }
}
