import { KitShipment } from './../../KitShipment/schemas/kitShipment.schema'
import mongoose from 'mongoose'
import { KitShipmentHistoryDocument } from '../schemas/kitShipmentHistory.schema'

export interface IKitShipmentHistoryRepository {
  createKitShipmentHistory(
    kitShipmentStatusId: string,
    kitShipmentId: string,
    customerId: string,
  ): Promise<KitShipmentHistoryDocument>

  findAllKitShipmentHistory(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipmentHistoryDocument[], KitShipmentHistoryDocument>

  countDocuments(filter: Record<string, unknown>): Promise<number>

  insertMany(docs: any[]): Promise<any>
}

export const IKitShipmentHistoryRepository = Symbol(
  'IKitShipmentHistoryRepository',
)
