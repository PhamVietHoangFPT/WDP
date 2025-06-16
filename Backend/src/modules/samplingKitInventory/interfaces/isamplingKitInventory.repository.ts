import { SamplingKitInventoryDocument } from '../schemas/samplingKitInventory.schema'
import { CreateSamplingKitInventoryDto } from '../dto/createSamplingKitInventory.dto'
import mongoose from 'mongoose'
import { UpdateInventoryDto } from '../dto/updateInventory.dto'

export interface ISamplingKitInventoryRepository {
  create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryDocument>

  findById(id: string): Promise<SamplingKitInventoryDocument | null>

  update(
    id: string,
    facilityId: string,
    userId: string,
    updateInventoryDto: UpdateInventoryDto,
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

  deleteByExpiredDate(date: Date): Promise<number>

  findBySampleIdAndQuantityInFacility(
    sampleId: string,
    quantity: number,
    facilityId: string,
  ): Promise<string | null>
}
export const ISamplingKitInventoryRepository = Symbol(
  'ISamplingKitInventoryRepository',
)
