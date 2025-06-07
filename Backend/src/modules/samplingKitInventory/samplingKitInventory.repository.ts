import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  SamplingKitInventory,
  SamplingKitInventoryDocument,
} from './schemas/samplingKitInventory.schema'
import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'

@Injectable()
export class SamplingKitInventoryRepository
  implements ISamplingKitInventoryRepository
{
  constructor(
    @InjectModel(SamplingKitInventory.name)
    private samplingKitInventoryModel: Model<SamplingKitInventoryDocument>,
  ) {}

  async create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryDocument> {
    const newSamplingKitInventory = new this.samplingKitInventoryModel({
      ...createSamplingKitInventoryDto,
      facility: facilityId,
      create_at: new Date(),
      create_by: userId,
      inventory: createSamplingKitInventoryDto.kitAmount,
    })
    return await newSamplingKitInventory.save()
  }

  async findById(id: string): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOne({ _id: id, deleted_at: null })
      .exec()
  }

  async update(
    id: string,
    facilityId: string,
    userId: string,
    updateSamplingKitInventoryDto: Partial<SamplingKitInventory>,
  ): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOneAndUpdate(
        { _id: id, facility: facilityId, deleted_at: null },
        {
          ...updateSamplingKitInventoryDto,
          update_at: new Date(),
          update_by: userId,
        },
        { new: true },
      )
      .exec()
  }

  async findByLotNumberAndFacility(
    lotNumber: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOne({ lotNumber, facility: facilityId, deleted_at: null })
      .exec()
  }

  async delete(
    id: string,
    userId: string,
  ): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
  }

  findAllByFacility(
    facilityId: string,
    filter: Record<string, unknown>,
  ): mongoose.Query<
    SamplingKitInventoryDocument[],
    SamplingKitInventoryDocument
  > {
    return this.samplingKitInventoryModel
      .find({
        facility: facilityId,
        deleted_at: null,
        ...filter,
      })
      .lean()
  }

  async updateInventory(
    id: string,
    facilityId: string,
    quantity: number,
  ): Promise<SamplingKitInventoryDocument | null> {
    const samplingKitInventory = await this.samplingKitInventoryModel
      .findById(id)
      .exec()
    const currentInventory = samplingKitInventory?.inventory || 0
    return this.samplingKitInventoryModel
      .findOneAndUpdate(
        { _id: id, facility: facilityId, deleted_at: null },
        {
          $inc: { inventory: currentInventory - quantity },
          update_at: new Date(),
        },
        { new: true },
      )
      .exec()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.samplingKitInventoryModel.countDocuments(filter).exec()
  }
}
