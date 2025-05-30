import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { IBookingStatusRepository } from './interfaces/ibookingStatus.repository'
import { IBookingStatusService } from './interfaces/ibookingStatus.service'
import { BookingStatusDocument } from './schemas/bookingStatus.schema'

@Injectable()
export class BookingStatusService implements IBookingStatusService {
  constructor(
    @Inject(IBookingStatusRepository)
    private readonly bookingStatusRepository: IBookingStatusRepository,
  ) {}

  async getAll(): Promise<BookingStatusDocument[]> {
    return this.bookingStatusRepository.getAll()
  }

  async findById(id: string): Promise<BookingStatusDocument> {
    const bookingStatus = await this.bookingStatusRepository.findById(id)
    if (!bookingStatus) {
      throw new NotFoundException(`Trạng thái đặt chỗ không tồn tại`)
    }
    return bookingStatus
  }

  async findByBookingStatus(
    name: string,
  ): Promise<BookingStatusDocument | null> {
    return this.bookingStatusRepository.findByBookingStatus(name)
  }
}
