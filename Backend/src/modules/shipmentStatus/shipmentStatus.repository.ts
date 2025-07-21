import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { IShipmentStatusRepository } from './interfaces/ishipmentStatus.repository'
import { ShipmentStatus, ShipmentStatusDocument } from './schemas/shipmentStatus.schema'
import { Model } from 'mongoose'

@Injectable()
export class ShipmentStatusRepository implements IShipmentStatusRepository {
    constructor(
        @InjectModel(ShipmentStatus.name)
        private shipmentStatusModel: Model<ShipmentStatusDocument>,
    ) { }

    async findAll(): Promise<ShipmentStatusDocument[] | null> {
        return await this.shipmentStatusModel.find({ deleted_at: null }).exec()
    }

    async findOneById(id: string): Promise<ShipmentStatusDocument | null> {
        return this.shipmentStatusModel.findOne({ _id: id, deleted_at: null }).exec()
    }
}
