import { UpdateSampleDto } from './dto/update-sample.dto'
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ISampleRepository } from './interfaces/isample.repository'
import { Sample, SampleDocument } from './schemas/sample.schema'
import { CreateSampleDto } from './dto/create-sample.dto'
import { ISampleTypeRepository } from '../sampleType/interfaces/isampleType.repository'
@Injectable()
export class SampleRepository implements ISampleRepository {
  constructor(
    @InjectModel(Sample.name)
    private sampleModel: Model<SampleDocument>,
    @Inject(ISampleTypeRepository)
    private readonly sampleType: ISampleTypeRepository,
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

  async getSampleTypeIdBySampleId(sampleId: string): Promise<string | null> {
    const sampleType = await this.sampleModel
      .findOne({ _id: sampleId, deleted_at: null })
      .select('sampleType')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return sampleType ? sampleType.sampleType.toString() : null
  }

  async getSampleTypeById(id: string): Promise<string | null> {
    const sample = await this.sampleModel
      .findOne({ _id: id, deleted_at: null })
      .populate('sampleType')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return sample?.sampleType ? sample.sampleType.toString() : null
  }

  async getSampleTotalPrice(id: string, sampleTypeId: string): Promise<number> {
    // Lấy document sample và chỉ chọn trường fee
    const sample = await this.sampleModel
      .findOne({ _id: id, deleted_at: null })
      .select('fee')
      .lean()
      .exec()

    // Lấy phí của sampleType
    const sampleTypeFee =
      await this.sampleType.getSampleTypeFeeById(sampleTypeId)

    // Kiểm tra nếu không tìm thấy một trong hai thì trả về 0
    if (!sample || sampleTypeFee == null) {
      // Hoặc bạn có thể throw new NotFoundException('Không tìm thấy thông tin phí');
      return 0
    }

    // Lấy giá trị fee từ object sample
    const sampleFee = sample.fee

    // Trả về tổng của hai loại phí
    return sampleFee + sampleTypeFee
  }
}
