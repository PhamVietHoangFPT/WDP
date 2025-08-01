import mongoose from 'mongoose'
import { CreateKitShipmentDto } from '../dto/createKitShipment.dto'
import { UpdateKitShipmentDto } from '../dto/updateKitShipment.dto'
import { KitShipment, KitShipmentDocument } from '../schemas/kitShipment.schema'

export interface IKitShipmentRepository {
  create(
    userId: string,
    createKitShipmentDto: CreateKitShipmentDto,
    currentStatus: string,
  ): Promise<KitShipmentDocument>
  // findOneById(id: string): Promise<KitShipmentDocument | null>
  findAllKitShipments(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipmentDocument[], KitShipmentDocument>
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
  getDeliveryStaffId(id: string): Promise<string | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<KitShipment[], KitShipment>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findKitShipmentForDeliveryStaff(
    deliveryStaffId: string,
    currentStatus: string,
  ): Promise<KitShipmentDocument[]>
  updateCurrentStatus(
    id: string,
    currentStatus: string,
    customerId: string,
  ): Promise<KitShipmentDocument | null>
  getAccountIdByKitShipmentId(id: string): Promise<string | null>
}

export const IKitShipmentRepository = Symbol('IKitShipmentRepository')
