import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  KitShipmentStatus,
  KitShipmentStatusDocument,
} from './schemas/kitShipmentStatus.schema'
import { IKitShipmentStatusRepository } from './interfaces/ikitShipmentStatus.repository'
import { CreateKitShipmentStatusDto } from './dto/createKitShipmentStatus.dto'
import { UpdateKitShipmentStatusDto } from './dto/updateKitShipmentStatus.dto'

@Injectable()
export class KitShipmentStatusRepository
  implements IKitShipmentStatusRepository
{
  constructor(
    @InjectModel(KitShipmentStatus.name)
    private KitShipmentStatusModel: Model<KitShipmentStatusDocument>,
  ) {}
  findByOrder(order: number): Promise<KitShipmentStatusDocument | null> {
    return this.KitShipmentStatusModel.findOne({
      order,
      deleted_at: null,
    }).exec()
  }

  async create(
    createTypeDto: CreateKitShipmentStatusDto,
    userId: string,
  ): Promise<KitShipmentStatusDocument> {
    const newType = new this.KitShipmentStatusModel({
      ...createTypeDto,
      created_at: new Date(),
      created_by: userId,
    })
    return await newType.save()
  }

  async findAll(): Promise<KitShipmentStatusDocument[]> {
    return this.KitShipmentStatusModel.find({ deleted_at: null }).exec()
  }

  async findById(id: string): Promise<KitShipmentStatusDocument | null> {
    return this.KitShipmentStatusModel.findOne({
      _id: id,
      deleted_at: null,
    }).exec()
  }

  async update(
    id: string,
    updateKitShipmentStatusDto: UpdateKitShipmentStatusDto,
    userId: string,
  ): Promise<KitShipmentStatusDocument | null> {
    return this.KitShipmentStatusModel.findByIdAndUpdate(
      id,
      {
        ...updateKitShipmentStatusDto,
        updated_at: new Date(),
        updated_by: userId,
      },
      { new: true },
    ).exec()
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.KitShipmentStatusModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date(), deleted_by: userId },
      { new: true },
    ).exec()
    return !!result
  }

  async findByName(status: string): Promise<KitShipmentStatusDocument | null> {
    return this.KitShipmentStatusModel.findOne({
      status,
      deleted_at: null,
    }).exec()
  }
}
