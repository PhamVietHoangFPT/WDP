import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { KitShipmentStatus, KitShipmentStatusSchema } from "./schemas/kitShipmentStatus.schema";
import { AuthModule } from "../auth/auth.module";
import { KitShipmentStatusController } from "./kitShipmentStatus.controller";
import { IKitShipmentStatusService } from "./interfaces/ikitShipmentStatus.service";
import { KitShipmentStatusService } from "./kitShipmentStatus.service";
import { IKitShipmentStatusRepository } from "./interfaces/ikitShipmentStatus.repository";
import { KitShipmentStatusRepository } from "./kitShipmentStatus.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: KitShipmentStatus.name, schema: KitShipmentStatusSchema },
        ]),
        AuthModule,
    ],
    controllers: [KitShipmentStatusController],
    providers: [
        {
            provide: IKitShipmentStatusService,
            useClass: KitShipmentStatusService,
        },
        {
            provide: IKitShipmentStatusRepository,
            useClass: KitShipmentStatusRepository,
        },
    ],
    exports: [IKitShipmentStatusRepository, IKitShipmentStatusService, MongooseModule],
})
export class KitShipmentStatusModule { }
