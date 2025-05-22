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

  async create(slotTemplateData: Partial<SlotTemplate>): Promise<SlotTemplate> {
    const newSlotTemplate = new this.slotTemplateModel(slotTemplateData)
    return await newSlotTemplate.save()
  }

  async findAll(): Promise<SlotTemplate[]> {
    return this.slotTemplateModel.find().exec()
  }

  async findById(id: string): Promise<SlotTemplate | null> {
    return this.slotTemplateModel.findById(id).exec()
  }

  async delete(id: string): Promise<SlotTemplate | null> {
    return this.slotTemplateModel.findByIdAndDelete(id).exec()
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
  ): Promise<SlotTemplate | null> {
    return this.slotTemplateModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .exec()
  }
}
