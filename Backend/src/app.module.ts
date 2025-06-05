import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { databaseConfig } from './config/database.config'
import { AccountModule } from './modules/account/account.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { SlotTemplateModule } from './modules/slotTemplate/slotTemplate.module'
import { SlotModule } from './modules/slot/slot.module'
import { SlotGenerationModule } from './modules/slotGenerator/slotGenerator.module'
import { ScheduleModule } from '@nestjs/schedule'
import { TestTakerModule } from './modules/testTaker/testTaker.module'
import { TestTakerRelationshipModule } from './modules/testTakerRelationship/testTakerRelationship.module'
import { ConditionModule } from './modules/condition/condition.module'
import { VnPayModule } from './modules/vnpay/vnpay.module'
import { PaymentModule } from './modules/payment/payment.module'
import { AddressModule } from './modules/address/address.module'
import { LocationModule } from './modules/location/location.module'
import { BookingModule } from './modules/booking/booking.module'
import { BookingStatusModule } from './modules/bookingStatus/bookingStatus.module'
import { PaymentTypeModule } from './modules/paymentType/paymentType.module'
import { ImageModule } from './modules/image/image.module'
import { TypeModule } from './modules/type/type.module'
import { TimeReturnModule } from './modules/timeReturn/timeReturn.module'
import { SamplingKitInventoryModule } from './modules/samplingKitInventory/samplingKitInventory.module'
import { RelationshipModule } from './modules/relationship/relationship.module'
@Module({
  imports: [
    databaseConfig,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AccountModule,
    AuthModule,
    SlotTemplateModule,
    SlotModule,
    SlotGenerationModule,
    TestTakerModule,
    TestTakerRelationshipModule,
    AddressModule,
    LocationModule,
    ConditionModule,
    PaymentModule,
    ImageModule,
    BookingModule,
    BookingStatusModule,
    PaymentTypeModule,
    VnPayModule,
    BookingModule,
    TypeModule,
    TimeReturnModule,
    SamplingKitInventoryModule,
    RelationshipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
