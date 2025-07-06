import mongoose from 'mongoose'
import { CreateKitShipmentDto } from '../dto/createKitShipment.dto'
import { UpdateKitShipmentDto } from '../dto/updateKitShipment.dto'
import { KitShipment, KitShipmentDocument } from '../schemas/kitShipment.schema'

export interface IKitShipmentRepository {
  create(
    userId: string,
    createKitShipmentDto: CreateKitShipmentDto,
  ): Promise<KitShipmentDocument>
  // findOneById(id: string): Promise<KitShipmentDocument | null>
  findAll(): Promise<KitShipmentDocument[]>
  updateKitShipmentById(
    id: string,
    userId: string,
    updateKitShipmentDto: Partial<UpdateKitShipmentDto>,
  ): Promise<KitShipmentDocument | null>
  restore(
    id: string,
    userId: string,
    updateKitShipmentDto: Partial<UpdateKitShipmentDto>,
  ): Promise<KitShipmentDocument | null>
  deleteKitShipmentById(
    id: string,
    userId: string,
  ): Promise<KitShipmentDocument | null>
  findById(id: string): Promise<KitShipmentDocument | null>
  getCurrentStatusId(id: string): Promise<string | null>
  getCaseMemberId(id: string): Promise<string | null>
  getSamplingKitInventoryId(id: string): Promise<string | null>
  getAddressId(id: string): Promise<string | null>
  getDeliveryStaffId(id: string): Promise<string | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipment[], KitShipment>
  countDocuments(filter: Record<string, unknown>): Promise<number>
}

export const IKitShipmentRepository = Symbol('IKitShipmentRepository')
