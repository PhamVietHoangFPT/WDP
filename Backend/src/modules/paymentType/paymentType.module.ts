import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PaymentType, PaymentTypeSchema } from './schemas/paymentType.schema'
import { PaymentTypeRepository } from './paymentType.repository'
import { IPaymentTypeRepository } from './interfaces/ipaymentType.repository'
import { PaymentTypeService } from './paymentType.service'
import { IPaymentTypeService } from './interfaces/ipaymentType.service'
import { PaymentTypeController } from './paymentType.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentType.name, schema: PaymentTypeSchema },
    ]),
  ],
  controllers: [PaymentTypeController],
  providers: [
    {
      provide: IPaymentTypeRepository,
      useClass: PaymentTypeRepository,
    },
    {
      provide: IPaymentTypeService,
      useClass: PaymentTypeService,
    },
  ],
  exports: [IPaymentTypeRepository, IPaymentTypeService],
})
export class PaymentTypeModule {}
