import { Injectable } from '@nestjs/common'
import { IServiceRepository } from './interfaces/iservice.repository'
import { InjectModel } from '@nestjs/mongoose'
import { Service, ServiceDocument } from './schemas/service.schema'
import { Model } from 'mongoose'
import { CreateServiceDto } from './dto/createService.dto'
import { UpdateServiceDto } from './dto/updateService.dto'

@Injectable()
export class ServiceRepository implements IServiceRepository {
  constructor(
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceDocument> {
    const newService = new this.serviceModel({
      ...createServiceDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newService.save()
  }
  async findOneById(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .populate({ path: 'timeReturn', select: '-_id timeReturn timeReturnFee' })
      .populate({ path: 'sample', select: '-_id name' })
      .exec()
  }

  async findAll(): Promise<ServiceDocument[] | null> {
    return await this.serviceModel
      .find({ deleted_at: null })
      .populate({ path: 'timeReturn', select: '-_id timeReturn timeReturnFee' })
      .populate({ path: 'sample', select: '-_id name' })
      .exec()
  }

  async updateServiceById(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    return this.serviceModel
      .findByIdAndUpdate(
        id,
        { ...updateServiceDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteServiceById(
    id: string,
    userId: string,
  ): Promise<ServiceDocument> {
    return this.serviceModel
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
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    return this.serviceModel
      .findByIdAndUpdate(
        id,
        {
          ...updateServiceDto,
          updated_by: userId,
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
        },
        { new: true },
      )
      .exec()
  }

  async findById(id: string): Promise<ServiceDocument | null> {
    return this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .populate({ path: 'timeReturn', select: '_id timeReturn timeReturnFee' })
      .populate({ path: 'sample', select: '_id name' })
      .exec()
  }

  async getSampleId(id: string): Promise<string | null> {
    const service = await this.serviceModel
      .findOne({ _id: id, deleted_at: null })
      .select('sample')
      .exec()
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return service?.sample.toString() || null
  }
}
