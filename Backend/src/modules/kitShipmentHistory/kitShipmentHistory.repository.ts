import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
    KitShipmentHistory,
    KitShipmentHistoryDocument,
} from './schemas/KitShipmentHistory.schema'
import { IKitShipmentHistoryRepository } from './interfaces/iKitShipmentHistory.repository'

@Injectable()
export class KitShipmentHistoryRepository
    implements IKitShipmentHistoryRepository {
    constructor(
        @InjectModel(KitShipmentHistory.name)
        private KitShipmentHistoryModel: Model<KitShipmentHistoryDocument>,
    ) { }

    async createKitShipmentHistory(
        kitShipmentStatusId: string,
        kitShipmentId: string,
        customerId: string,
    ): Promise<KitShipmentHistoryDocument> {
        const createdKitShipmentHistory = new this.KitShipmentHistoryModel({
            kitShipmentStatusId: new mongoose.Types.ObjectId(kitShipmentStatusId),
            kitShipmentId: new mongoose.Types.ObjectId(kitShipmentId),
            customerId: new mongoose.Types.ObjectId(customerId),
            createdAt: new Date(),
        })
        return createdKitShipmentHistory.save()
    }

    findAllKitShipmentHistory(
        filter: Record<string, unknown>,
    ): mongoose.Query<KitShipmentHistoryDocument[], KitShipmentHistoryDocument> {
        return this.KitShipmentHistoryModel
            .find(filter)
            .select('_id kitShipmentStatus created_at')
            .populate({
                path: 'kitShipmentStatus',
                select: 'status order -_id',
            })
            .lean()
    }

    async countDocuments(filter: Record<string, unknown>): Promise<number> {
        return this.KitShipmentHistoryModel.countDocuments(filter).exec()
    }

    async insertMany(docs: any[]): Promise<any> {
        // Gọi thẳng hàm insertMany của model
        return this.KitShipmentHistoryModel.insertMany(docs)
    }
}
