import { Injectable } from '@nestjs/common'
import { CreateTimeReturnDto } from './dto/createTimeReturn.dto'
import { ITimeReturnRepository } from './interfaces/itimeReturn.repository'
import { TimeReturn, TimeReturnDocument } from './schemas/timeReturn.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UpdateTimeReturnDto } from './dto/updateTimeReturn.dto'
@Injectable()
export class TimeReturnRepository implements ITimeReturnRepository {
  constructor(
    @InjectModel(TimeReturn.name)
    private timeReturnModel: Model<TimeReturnDocument>,
  ) {}

  async create(
    userId: string,
    createTimeReturnDto: CreateTimeReturnDto,
  ): Promise<TimeReturnDocument> {
    const newTimeReturn = new this.timeReturnModel({
      ...createTimeReturnDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newTimeReturn.save()
  }

  async findOneById(id: string): Promise<TimeReturnDocument | null> {
    return await this.timeReturnModel.findById(id).exec()
  }

  async findAll(): Promise<TimeReturnDocument[]> {
    return await this.timeReturnModel.find({ deleted_at: null }).exec()
  }

  async updateTimeReturnById(
    id: string,
    userId: string,
    updateTimeReturnDto: Partial<UpdateTimeReturnDto>,
  ): Promise<TimeReturnDocument | null> {
    return await this.timeReturnModel
      .findByIdAndUpdate(
        id,
        { ...updateTimeReturnDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async restore(
    id: string,
    userId: string,
    updateTimeReturnDto: Partial<UpdateTimeReturnDto>,
  ): Promise<TimeReturnDocument | null> {
    return await this.timeReturnModel
      .findByIdAndUpdate(
        id,
        {
          ...updateTimeReturnDto,
          updated_by: userId,
          updated_at: new Date(),
          deleted_at: null,
          deleted_by: null,
        },
        { new: true },
      )
      .exec()
  }

  async deleteTimeReturnById(
    id: string,
    userId: string,
  ): Promise<TimeReturnDocument | null> {
    return await this.timeReturnModel
      .findByIdAndUpdate(
        id,
        { deleted_by: userId, deleted_at: new Date() },
        { new: true },
      )
      .exec()
  }
}
