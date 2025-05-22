import { SlotTemplate } from '../schemas/slotTemplate.schema'
import mongoose from 'mongoose'

export interface ISlotTemplateRepository {
  create(slotTemplateData: Partial<SlotTemplate>): Promise<SlotTemplate>
  findAll(): Promise<SlotTemplate[]>
  findById(id: string): Promise<SlotTemplate | null>
  delete(id: string): Promise<SlotTemplate | null>
  find(filter: Record<string, unknown>): Promise<SlotTemplate[]>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<SlotTemplate[], SlotTemplate>
  findByIdAndUpdate(
    id: string,
    updateData: Partial<SlotTemplate>,
  ): Promise<SlotTemplate | null>
}

export const ISlotTemplateRepository = Symbol('ISlotTemplateRepository')
