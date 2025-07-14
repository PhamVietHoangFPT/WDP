import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  SamplingKitInventory,
  SamplingKitInventoryDocument,
} from './schemas/samplingKitInventory.schema'
import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { UpdateInventoryDto } from './dto/updateInventory.dto'
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
      importDate: new Date(),
      facility: facilityId,
      create_at: new Date(),
      create_by: userId,
      inventory: createSamplingKitInventoryDto.kitAmount,
    })
    return await newSamplingKitInventory.save()
  }

  async findById(id: string): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOne({ _id: id })
      .populate([
        { path: 'sample', select: 'name' },
        { path: 'facility', select: 'facilityName' },
      ])
      .exec()
  }

  async update(
    id: string,
    facilityId: string,
    userId: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOneAndUpdate(
        { _id: id, facility: facilityId, deleted_at: null },
        {
          ...updateInventoryDto,
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
        ...filter,
      })
      .populate({ path: 'sample', select: 'name' })
      .lean()
  }

  async updateInventory(
    id: string,
    facilityId: string,
    quantity: number,
  ): Promise<SamplingKitInventoryDocument | null> {
    return await this.samplingKitInventoryModel
      .findOneAndUpdate(
        {
          _id: id,
          facility: facilityId,
          deleted_at: null,
        },
        {
          $inc: { inventory: -quantity },
          $set: { updated_at: new Date() },
        },
        { new: true },
      )
      .exec()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return await this.samplingKitInventoryModel.countDocuments(filter).exec()
  }

  async deleteByExpiredDate(date: Date): Promise<number> {
    const data = await this.samplingKitInventoryModel
      .countDocuments({ expDate: { $lt: date }, deleted_at: null })
      .exec()
    await this.samplingKitInventoryModel
      .updateMany(
        { expDate: { $lt: date }, deleted_at: null },
        { deleted_at: new Date() },
      )
      .exec()
    return data
  }

  async findBySampleIdAndQuantityInFacility(
    sampleId: string,
    quantity: number,
    facilityId: string,
  ): Promise<string | null> {
    const samplingKitInventory = await this.samplingKitInventoryModel
      .findOne({
        sample: sampleId,
        deleted_at: null,
        inventory: { $gte: quantity },
        facility: facilityId,
      })
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return samplingKitInventory ? samplingKitInventory._id.toString() : null
  }

  findAllExpiredKits(
    facilityId: string,
    filter: Record<string, unknown>,
  ): mongoose.Query<
    SamplingKitInventoryDocument[],
    SamplingKitInventoryDocument
  > {
    return this.samplingKitInventoryModel
      .find({
        facility: facilityId,
        expDate: { $lt: new Date() },
        deleted_at: { $exists: true },
        ...filter,
      })
      .populate({ path: 'sample', select: 'name' })
      .lean()
  }
}
