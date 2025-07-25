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
import { PaymentTypeModule } from '../paymentType/paymentType.module'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import { KitShipmentModule } from '../KitShipment/kitShipment.module'
import { KitShipmentStatusModule } from '../kitShipmentStatus/kitShipmentStatus.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    AuthModule,
    BookingModule,
    PaymentTypeModule,
    ServiceCaseModule,
    TestRequestStatusModule,
    KitShipmentModule,
    KitShipmentStatusModule,
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
