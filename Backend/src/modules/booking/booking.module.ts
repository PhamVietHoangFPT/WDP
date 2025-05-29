// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Booking, BookingSchema } from './schemas/booking.schema'
import { AccountModule } from '../account/account.module'
import { SlotModule } from '../slot/slot.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    AccountModule,
    SlotModule,
  ],
  exports: [MongooseModule],
})
export class BookingModule {}
