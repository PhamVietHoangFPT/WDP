import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  SlotTemplate,
  SlotTemplateDocument,
} from './schemas/slotTemplate.schema'
import { ISlotTemplateRepository } from './interfaces/islotTemplate.repository'

@Injectable()
export class SlotTemplateRepository implements ISlotTemplateRepository {
  constructor(
    @InjectModel(SlotTemplate.name)
    private slotTemplateModel: Model<SlotTemplateDocument>,
  ) {}

  async create(
    slotTemplateData: Partial<SlotTemplate>,
    userId: string,
  ): Promise<SlotTemplate> {
    const newSlotTemplate = new this.slotTemplateModel(slotTemplateData)
    newSlotTemplate.created_by = new mongoose.Types.ObjectId(userId) as any
    return await newSlotTemplate.save()
  }

  async findAll(): Promise<SlotTemplate[]> {
    return this.slotTemplateModel
      .find({
        deleted_at: { $exists: false },
      })
      .exec()
  }

  async findById(id: string): Promise<SlotTemplate | null> {
    return this.slotTemplateModel
      .findById({ id: id, deleted_at: { $exists: false } })
      .exec()
  }

  async checkDeleted(id: string): Promise<boolean> {
    const slotTemplate = await this.slotTemplateModel.findById(id).exec()
    if (slotTemplate.deleted_at) {
      return true
    }
    return false
  }

  async delete(id: string, userId: string): Promise<SlotTemplate | null> {
    return this.slotTemplateModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.slotTemplateModel.countDocuments(filter).exec()
  }

  // CÓ THỂ giữ lại hàm find cơ bản nếu muốn, nhưng PHẢI trả về Query
  find(
    filter: Record<string, unknown>,
  ): mongoose.Query<SlotTemplateDocument[], SlotTemplateDocument> {
    return this.slotTemplateModel.find(filter).lean()
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<SlotTemplateDocument[], SlotTemplateDocument> {
    return this.slotTemplateModel
      .find(filter)
      .lean()
      .populate({ path: 'facility', select: 'name ' }) // Return a query object for chaining
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<SlotTemplate>,
    userId: string,
  ): Promise<SlotTemplate | null> {
    updateData.updated_by = new mongoose.Types.ObjectId(userId) as any
    updateData.updated_at = new Date()
    return this.slotTemplateModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .exec()
  }

  async checkExistByFacilityAndNotDeleted(
    slotTemplateData: Partial<SlotTemplate>,
  ): Promise<boolean> {
    const count1 = await this.slotTemplateModel.countDocuments({
      facility: slotTemplateData.facility,
      deleted_at: null,
    })

    const count2 = await this.slotTemplateModel.countDocuments({
      facility: slotTemplateData.facility,
      isSunday: !slotTemplateData.isSunday,
      deleted_at: null,
    })
    const count = count1 + count2
    return count > 0
  }

  async findByFacilityId(facilityId: string): Promise<SlotTemplate[]> {
    return this.slotTemplateModel
      .find({
        facility: facilityId,
        deleted_at: null,
        isSunday: false,
      })
      .exec()
  }
}
