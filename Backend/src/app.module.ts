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
import { VnPayModule } from './modules/vnpay/vnpay.module'
import { PaymentModule } from './modules/payment/payment.module'
import { AddressModule } from './modules/address/address.module'
import { LocationModule } from './modules/location/location.module'
import { BookingModule } from './modules/booking/booking.module'
import { PaymentTypeModule } from './modules/paymentType/paymentType.module'
import { ImageModule } from './modules/image/image.module'
import { SampleModule } from './modules/sample/sample.module'
import { BlogModule } from './modules/blog/blog.module'
import { TimeReturnModule } from './modules/timeReturn/timeReturn.module'
import { SamplingKitInventoryModule } from './modules/samplingKitInventory/samplingKitInventory.module'
import { CaseMemberModule } from './modules/caseMember/caseMember.module'
import { ServiceModule } from './modules/service/service.module'
import { TestRequestStatusModule } from './modules/testRequestStatus/testRequestStatus.module'
import { ServiceCaseModule } from './modules/serviceCase/serviceCase.module'
import { TestRequestHistoryModule } from './modules/testRequestHistory/testRequestHistory.module'
import { ResultModule } from './modules/result/result.module'
import { KitShipmentStatusModule } from './modules/kitShipmentStatus/kitShipmentStatus.module'
import { ManagerModule } from './modules/manager/manager.module'
import { EmailModule } from './modules/email/email.module'
import { KitShipmentModule } from './modules/KitShipment/kitShipment.module'
import { DoctorModule } from './modules/doctor/doctor.module'
import { SampleCollectorModule } from './modules/sampleCollector/sampleCollector.module'
import { ConditionModule } from './modules/condition/condition.module'
import { StaffModule } from './modules/staff/staff.module'
import { ShipmentStatusModule } from './modules/shipmentStatus/shipmentStatus.modules'
import { TestResultShipmentModule } from './modules/testResultShipment/testResultShipment.module'
import { TestResultShipmentHistoryModule } from './modules/testResultShipmentHistory/testResultShipmentHIstory.module'
import { AdminModule } from './modules/admin/admin.module'
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
    AddressModule,
    LocationModule,
    PaymentModule,
    ImageModule,
    BlogModule,
    BookingModule,
    PaymentTypeModule,
    VnPayModule,
    BookingModule,
    SampleModule,
    TimeReturnModule,
    SamplingKitInventoryModule,
    CaseMemberModule,
    ServiceModule,
    TestRequestStatusModule,
    ServiceCaseModule,
    TestRequestHistoryModule,
    ResultModule,
    KitShipmentStatusModule,
    ManagerModule,
    EmailModule,
    KitShipmentModule,
    DoctorModule,
    SampleCollectorModule,
    ConditionModule,
    StaffModule,
    ShipmentStatusModule,
    TestResultShipmentModule,
    TestResultShipmentHistoryModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
