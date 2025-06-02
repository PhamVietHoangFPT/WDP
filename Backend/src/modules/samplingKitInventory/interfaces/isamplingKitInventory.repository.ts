import {
  SamplingKitInventory,
  SamplingKitInventoryDocument,
} from '../schemas/samplingKitInventory.schema'
import { CreateSamplingKitInventoryDto } from '../dto/createSamplingKitInventory.dto'
import mongoose from 'mongoose'

export interface ISamplingKitInventoryRepository {
  create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
  ): Promise<SamplingKitInventoryDocument>

  findById(
    id: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryDocument | null>

  update(
    id: string,
    facilityId: string,
    userId: string,
    updateSamplingKitInventoryDto: Partial<SamplingKitInventory>,
  ): Promise<SamplingKitInventoryDocument | null>

  updateInventory(
    id: string,
    facilityId: string,
    quantity: number,
  ): Promise<SamplingKitInventoryDocument | null>

  findByLotNumberAndFacility(
    lotNumber: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryDocument | null>

  delete(
    id: string,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryDocument | null>

  findAllByFacility(
    facilityId: string,
    filter: Record<string, unknown>,
  ): mongoose.Query<
    SamplingKitInventoryDocument[],
    SamplingKitInventoryDocument
  >

  countDocuments(
    filter: Record<string, unknown>,
    facilityId: string,
  ): Promise<number>
}
export const ISamplingKitInventoryRepository = Symbol(
  'ISamplingKitInventoryRepository',
)
