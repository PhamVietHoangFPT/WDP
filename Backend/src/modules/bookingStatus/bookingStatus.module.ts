// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  bookingStatus,
  bookingStatusSchema,
} from './schemas/bookingStatus.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: bookingStatus.name, schema: bookingStatusSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class BookingStatusModule {}
