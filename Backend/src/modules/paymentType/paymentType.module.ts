// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PaymentType, PaymentTypeSchema } from './schemas/paymentType.schema'
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaymentType.name, schema: PaymentTypeSchema },
    ]),
  ],

  exports: [MongooseModule],
})
export class PaymentTypeModule {}
