import { UpdateSampleDto } from './dto/update-sample.dto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ISampleRepository } from './interfaces/isample.repository'
import { Sample, SampleDocument } from './schemas/sample.schema'
import { CreateSampleDto } from './dto/create-sample.dto'
@Injectable()
export class SampleRepository implements ISampleRepository {
  constructor(
    @InjectModel(Sample.name)
    private sampleModel: Model<SampleDocument>,
  ) {}

  async create(
    userId: string,
    createSampleDto: CreateSampleDto,
  ): Promise<SampleDocument> {
    const newSample = new this.sampleModel({
      ...createSampleDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newSample.save()
  }

  async findOneByName(name: string): Promise<SampleDocument | null> {
    return this.sampleModel
      .findOne({
        name,
      })
      .exec()
  }

  async findOneById(id: string): Promise<SampleDocument | null> {
    return this.sampleModel
      .findOne({ _id: id, deleted_at: null })
      .populate({ path: 'sampleType', select: 'name' })
      .exec()
  }

  async findAll(): Promise<SampleDocument[] | null> {
    return await this.sampleModel
      .find({ deleted_at: null })
      .populate({ path: 'sampleType', select: 'name' })
      .exec()
  }

  async updateSampleById(
    id: string,
    userId: string,
    updateSampleDto: UpdateSampleDto,
  ): Promise<SampleDocument> {
    return this.sampleModel
      .findByIdAndUpdate(
        id,
        { ...updateSampleDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteSampleById(id: string, userId: string): Promise<SampleDocument> {
    return this.sampleModel
      .findByIdAndUpdate(
        id,
        { deleted_by: userId, deleted_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async restore(
    id: string,
    userId: string,
    updateSampleDto: UpdateSampleDto,
  ): Promise<SampleDocument> {
    return this.sampleModel
      .findByIdAndUpdate(
        id,
        {
          ...updateSampleDto,
          updated_by: userId,
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
        },
        { new: true },
      )
      .exec()
  }
}
