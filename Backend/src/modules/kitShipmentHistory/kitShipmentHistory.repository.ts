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
    kitShipmentStatus: string,
    kitShipment: string,
    customer: string,
  ): Promise<KitShipmentHistoryDocument> {
    const createdKitShipmentHistory = new this.KitShipmentHistoryModel({
      kitShipmentStatus: new mongoose.Types.ObjectId(kitShipmentStatus),
      kitShipment: new mongoose.Types.ObjectId(kitShipment),
      customer: new mongoose.Types.ObjectId(customer),
      createdAt: new Date(),
    })
    return createdKitShipmentHistory.save()
  }

  findAllKitShipmentHistory(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipmentHistoryDocument[], KitShipmentHistoryDocument> {
    // Return as promise for better debugging
    return this.KitShipmentHistoryModel.find(filter)
      .populate({
        path: 'kitShipmentStatus',
        select: 'status order -_id',
        match: { order: { $in: [2, 3, 4, 6] } }
      })
      .select('_id kitShipmentStatus kitShipment created_at')
      .lean() as any
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    // For now, count all matching documents and filter later
    return this.KitShipmentHistoryModel.countDocuments(filter).exec()
  }

  async insertMany(docs: any[]): Promise<any> {
    // Gọi thẳng hàm insertMany của model
    return this.KitShipmentHistoryModel.insertMany(docs)
  }
}
