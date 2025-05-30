// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Booking, BookingSchema } from './schemas/booking.schema'
import { AccountModule } from '../account/account.module'
import { SlotModule } from '../slot/slot.module'
import { BookingController } from './booking.controller'
import { IBookingRepository } from './interfaces/ibooking.repository'
import { BookingRepository } from './booking.repository'
import { IBookingService } from './interfaces/ibooking.service'
import { BookingService } from './booking.service'
import { AuthModule } from '../auth/auth.module'
import { BookingStatusModule } from '../bookingStatus/bookingStatus.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    AccountModule,
    SlotModule,
    AuthModule,
    BookingStatusModule,
  ],

  controllers: [BookingController],

  providers: [
    {
      provide: IBookingRepository,
      useClass: BookingRepository,
    },
    {
      provide: IBookingService,
      useClass: BookingService,
    },
  ],
  exports: [IBookingRepository, IBookingService],
})
export class BookingModule {}
