import { Controller, Get, Inject } from '@nestjs/common'
import { IBookingStatusService } from './interfaces/ibookingStatus.service'
import { BookingStatusDocument } from './schemas/bookingStatus.schema'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('BookingStatus')
@Controller('booking-status')
export class BookingStatusController {
  constructor(
    @Inject(IBookingStatusService)
    private readonly bookingStatusService: IBookingStatusService,
  ) {}

  @Get()
  async getAll(): Promise<BookingStatusDocument[]> {
    return this.bookingStatusService.getAll()
  }

  @Get(':id')
  async findById(id: string): Promise<BookingStatusDocument> {
    return this.bookingStatusService.findById(id)
  }
}
