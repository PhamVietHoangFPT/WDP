import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthModule } from '../auth/auth.module'
import { AccountModule } from '../account/account.module'
import { ShipmentStatus, ShipmentStatusSchema } from './schemas/shipmentStatus.schema'
import { ShipmentStatusController } from './shipmentStatus.controller'
import { IShipmentStatusRepository } from './interfaces/ishipmentStatus.repository'
import { ShipmentStatusRepository } from './shipmentStatus.repository'
import { IShipmentStatusService } from './interfaces/ishipmentStatus.service'
import { ShipmentStatusService } from './shipmentStatus.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ShipmentStatus.name, schema: ShipmentStatusSchema },
        ]),
        AuthModule,
        AccountModule,
    ],
    controllers: [ShipmentStatusController],
    providers: [
        {
            provide: IShipmentStatusRepository,
            useClass: ShipmentStatusRepository,
        },
        {
            provide: IShipmentStatusService,
            useClass: ShipmentStatusService,
        },
    ],
    exports: [IShipmentStatusRepository, IShipmentStatusService],
})
export class ShipmentStatusModule { }
