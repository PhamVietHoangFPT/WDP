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
import { BookingDocument } from './schemas/booking.schema'
import { ISlotRepository } from '../slot/interfaces/islot.repository'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import mongoose from 'mongoose'
import { IEmailService } from '../email/interfaces/iemail.service'
import { Cron, CronExpression } from '@nestjs/schedule'
@Injectable()
export class BookingService implements IBookingService {
  constructor(
    @Inject(IBookingRepository)
    private readonly bookingRepository: IBookingRepository,
    @Inject(ISlotRepository)
    private readonly slotRepository: ISlotRepository,
    @Inject(IEmailService)
    private readonly emailService: IEmailService,
  ) {}

  private mapToResponseDto(data: BookingDocument): BookingResponseDto {
    // Constructor của DTO mới sẽ tự động gán các thuộc tính khớp tên
    return new BookingResponseDto({
      _id: data._id,
      slot: data.slot,
      bookingDate: data.bookingDate,
      note: data.note,
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
    const data = bookings.map((booking: BookingDocument) =>
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

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async autoSendEmailForNotification(): Promise<void> {
    const currentDate = new Date()
    const bookings: Array<{ _id: string; accountId: string }> =
      await this.bookingRepository.getAllBookingsIdByCurrentDate(currentDate)

    for (const bookingInfo of bookings) {
      const bookingId: string = bookingInfo._id
      const customerId: string = bookingInfo.accountId
      await this.emailService.sendEmailNotificationForCheckIn(
        customerId,
        bookingId,
      )
    }
  }
}
