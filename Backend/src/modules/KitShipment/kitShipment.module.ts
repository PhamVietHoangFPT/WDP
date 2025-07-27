import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { KitShipment, KitShipmentSchema } from './schemas/kitShipment.schema'
import { AuthModule } from '../auth/auth.module'
import { AccountModule } from '../account/account.module'
import { KitShipmentStatusModule } from '../kitShipmentStatus/kitShipmentStatus.module'
import { AddressModule } from '../address/address.module'
import { CaseMemberModule } from '../caseMember/caseMember.module'
import { SamplingKitInventoryModule } from '../samplingKitInventory/samplingKitInventory.module'
import { KitShipmentController } from './kitShipment.controller'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { KitShipmentRepository } from './kitShipment.repository'
import { IKitShipmentService } from './interfaces/ikitShipment.service'
import { KitShipmentService } from './kitShipment.service'
import { KitShipmentHistoryModule } from '../kitShipmentHistory/kitShipmentHistory.module'
import { TestTakerModule } from '../testTaker/testTaker.module'
import { BookingModule } from '../booking/booking.module'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import { ServiceCase } from '../serviceCase/schemas/serviceCase.schema'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitShipment.name, schema: KitShipmentSchema },
    ]),
    AuthModule,
    AccountModule,
    KitShipmentStatusModule,
    AddressModule,
    CaseMemberModule,
    SamplingKitInventoryModule,
    KitShipmentHistoryModule,
    TestTakerModule,
    BookingModule,
    TestRequestStatusModule,
    ServiceCaseModule, // Ensure ServiceCase is imported if needed in the repository/service
  ],
  controllers: [KitShipmentController],
  providers: [
    {
      provide: IKitShipmentRepository,
      useClass: KitShipmentRepository,
    },
    {
      provide: IKitShipmentService,
      useClass: KitShipmentService,
    },
  ],
  exports: [IKitShipmentRepository, IKitShipmentService],
})
export class KitShipmentModule {}
