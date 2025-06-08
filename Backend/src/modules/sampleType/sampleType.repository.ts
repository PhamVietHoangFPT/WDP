import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { SampleType, SampleTypeDocument } from './schemas/sampleType.schema'
import { CreateSampleTypeDto } from './dto/createSampleType.dto'
import { UpdateSampleTypeDto } from './dto/updateSampleType.dto'
import { ISampleTypeRepository } from './interfaces/isampleType.repository'

@Injectable()
export class SampleTypeRepository implements ISampleTypeRepository {
  constructor(
    @InjectModel(SampleType.name)
    private sampleTypeModel: Model<SampleTypeDocument>,
  ) {}

  async create(
    createTypeDto: CreateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeDocument> {
    const newType = new this.sampleTypeModel({
      ...createTypeDto,
      created_at: new Date(),
      created_by: userId,
    })
    return await newType.save()
  }

  async findAll(): Promise<SampleTypeDocument[]> {
    return this.sampleTypeModel.find({ deleted_at: null }).exec()
  }

  async findById(id: string): Promise<SampleTypeDocument | null> {
    return this.sampleTypeModel.findOne({ id: id, deleted_at: null }).exec()
  }

  async update(
    id: string,
    updateTypeDto: UpdateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeDocument | null> {
    return this.sampleTypeModel
      .findByIdAndUpdate(
        id,
        { ...updateTypeDto, updated_at: new Date(), updated_by: userId },
        { new: true },
      )
      .exec()
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.sampleTypeModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
    return !!result
  }

  async findTypeByName(name: string): Promise<SampleTypeDocument | null> {
    return this.sampleTypeModel.findOne({ name, deleted_at: null }).exec()
  }
}
