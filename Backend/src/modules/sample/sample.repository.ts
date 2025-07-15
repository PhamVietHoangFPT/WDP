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
    return this.sampleModel.findOne({ _id: id, deleted_at: null }).exec()
  }

  async findAll(): Promise<SampleDocument[] | null> {
    return await this.sampleModel.find({ deleted_at: null }).exec()
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

  async getSampleTotalPrice(id: string): Promise<number> {
    // Lấy document sample và chỉ chọn trường fee
    const sample = await this.sampleModel
      .findOne({ _id: id, deleted_at: null })
      .select('fee')
      .lean()
      .exec()

    // Kiểm tra nếu không tìm thấy một trong hai thì trả về 0
    if (!sample) {
      // Hoặc bạn có thể throw new NotFoundException('Không tìm thấy thông tin phí');
      return 0
    }

    // Lấy giá trị fee từ object sample
    const sampleFee = sample.fee

    // Trả về tổng của hai loại phí
    return sampleFee
  }
}
