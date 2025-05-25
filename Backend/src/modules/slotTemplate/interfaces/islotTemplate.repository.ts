import { SlotTemplate } from '../schemas/slotTemplate.schema'
import mongoose from 'mongoose'

export interface ISlotTemplateRepository {
  create(
    slotTemplateData: Partial<SlotTemplate>,
    userId: string,
  ): Promise<SlotTemplate>
  findAll(): Promise<SlotTemplate[]>
  findById(id: string): Promise<SlotTemplate | null>
  delete(id: string, userId: string): Promise<SlotTemplate | null>
  find(filter: Record<string, unknown>): Promise<SlotTemplate[]>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<SlotTemplate[], SlotTemplate>
  findByIdAndUpdate(
    id: string,
    updateData: Partial<SlotTemplate>,
    userId: string,
  ): Promise<SlotTemplate | null>
  checkDeleted(id: string): Promise<boolean>
  checkExistByFacilityAndNotDeleted(
    slotTemplateData: Partial<SlotTemplate>,
  ): Promise<boolean>
  findByFacilityId(facilityId: string): Promise<SlotTemplate[]>
}

export const ISlotTemplateRepository = Symbol('ISlotTemplateRepository')
