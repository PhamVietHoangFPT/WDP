// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Payment, PaymentSchema } from './schemas/payment.schema'
import { PaymentController } from './payment.controller'
import { AuthModule } from '../auth/auth.module'
import { IPaymentRepository } from './interfaces/ipayment.repository'
import { IPaymentService } from './interfaces/ipayment.service'
import { PaymentService } from './payment.service'
import { PaymentRepository } from './payment.repository'
import { BookingModule } from '../booking/booking.module'
import { BookingStatusModule } from '../bookingStatus/bookingStatus.module'
import { PaymentTypeModule } from '../paymentType/paymentType.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    AuthModule,
    BookingModule,
    BookingStatusModule,
    PaymentTypeModule,
  ],

  controllers: [PaymentController],
  providers: [
    {
      provide: IPaymentRepository,
      useClass: PaymentRepository,
    },
    {
      provide: IPaymentService,
      useClass: PaymentService,
    },
  ],

  exports: [MongooseModule],
})
export class PaymentModule {}
