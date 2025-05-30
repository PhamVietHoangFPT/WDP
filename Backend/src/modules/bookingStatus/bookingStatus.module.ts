import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  BookingStatus,
  BookingStatusSchema,
} from './schemas/bookingStatus.schema'
import { BookingStatusRepository } from './bookingStatus.repository'
import { IBookingStatusRepository } from './interfaces/ibookingStatus.repository'
import { BookingStatusService } from './bookingStatus.service'
import { IBookingStatusService } from './interfaces/ibookingStatus.service'
import { BookingStatusController } from './bookingStatus.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BookingStatus.name, schema: BookingStatusSchema },
    ]),
  ],
  controllers: [BookingStatusController],
  providers: [
    {
      provide: IBookingStatusRepository,
      useClass: BookingStatusRepository,
    },
    {
      provide: IBookingStatusService,
      useClass: BookingStatusService,
    },
  ],
  exports: [IBookingStatusRepository, IBookingStatusService],
})
export class BookingStatusModule {}
