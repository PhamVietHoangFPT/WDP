import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DeliveryStaffController } from './deliveryStaff.controller'
import { IDeliveryStaffRepository } from './interfaces/ideliveryStaff.repository'
import { DeliveryStaffRepository } from './deliveryStaff.repository'
import { IDeliveryStaffService } from './interfaces/ideliveryStaff.service'
import { DeliveryStaffService } from './deliveryStaff.service'
import {
  KitShipment,
  KitShipmentSchema,
} from '../kitShipment/schemas/kitShipment.schema'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusModule } from '../testRequestStatus/testRequestStatus.module'
import {
  TestRequestStatus,
  TestRequestStatusSchema,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'
import { AuthModule } from '../auth/auth.module'
import { KitShipmentModule } from '../kitShipment/kitShipment.module'
import {
  KitShipmentStatus,
  KitShipmentStatusSchema,
} from '../kitShipmentStatus/schemas/kitShipmentStatus.schema'
import { KitShipmentStatusModule } from '../kitShipmentStatus/kitShipmentStatus.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KitShipment.name, schema: KitShipmentSchema },
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      {
        name: TestRequestStatus.name,
        schema: TestRequestStatusSchema,
      },
      {
        name: KitShipmentStatus.name,
        schema: KitShipmentStatusSchema,
      },
    ]),
    AuthModule,
    KitShipmentModule,
    TestRequestStatusModule,
    ServiceCaseModule,
    KitShipmentStatusModule,
  ],
  controllers: [DeliveryStaffController],
  providers: [
    {
      provide: IDeliveryStaffRepository,
      useClass: DeliveryStaffRepository,
    },
    {
      provide: IDeliveryStaffService,
      useClass: DeliveryStaffService,
    },
  ],
  exports: [IDeliveryStaffService, IDeliveryStaffRepository],
})
export class DeliveryStaffModule {}
