import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model, Types } from 'mongoose'
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
    ids: string[], // 1. Sửa tham số để nhận vào một mảng ID
    facilityId: string,
    quantity: number,
  ): Promise<any> {
    // 2. Sửa kiểu trả về cho phù hợp với updateMany

    return this.samplingKitInventoryModel
      .updateMany(
        // Điều kiện tìm kiếm: Tìm tất cả document có _id nằm trong mảng `ids`
        // và thuộc về đúng facilityId.
        {
          _id: { $in: ids },
          facility: new Types.ObjectId(facilityId),
          deleted_at: null,
        },
        // Nội dung cập nhật: Trừ đi số lượng tồn kho
        {
          $inc: { inventory: -quantity },
          $set: { updated_at: new Date() },
        },
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
    sampleIds: string[],
    quantity: number,
    facilityId: string,
  ): Promise<string[]> {
    // ✅ 1. Sửa kiểu trả về thành mảng string

    // `find` sẽ trả về một mảng các document khớp điều kiện
    const inventories = await this.samplingKitInventoryModel
      .find({
        sample: { $in: sampleIds }, // Dùng $in để tìm tất cả sampleId trong mảng
        deleted_at: null,
        inventory: { $gte: quantity },
        facility: new Types.ObjectId(facilityId), // Đảm bảo facilityId là ObjectId
      })
      .select('_id') // Chỉ lấy trường _id để tối ưu
      .lean()
      .exec()

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return inventories.map((inv) => inv._id.toString())
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

  async findBySampleIdAndFacilityId(
    sampleId: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryDocument | null> {
    return this.samplingKitInventoryModel
      .findOne({
        sample: new Types.ObjectId(sampleId),
        facility: new Types.ObjectId(facilityId),
        deleted_at: null,
        expDate: { $gte: new Date() },
      })
      .select('-deleted_at -created_at -updated_at -facility -sample')
      .lean()
      .exec()
  }
}
