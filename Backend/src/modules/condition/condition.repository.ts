import { Injectable } from '@nestjs/common'

import { IConditionRepository } from './interfaces/icondition.repository'
import { Condition, ConditionDocument } from './schemas/condition.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateConditionDto } from './dto/create-condition.dto'
import { UpdateConditionDto } from './dto/update-condition.dto'
@Injectable()
export class ConditionRepository implements IConditionRepository {
  constructor(
    @InjectModel(Condition.name)
    private conditionModel: Model<ConditionDocument>,
  ) {}

  async create(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<ConditionDocument> {
    const newCondition = new this.conditionModel({
      ...createConditionDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newCondition.save()
  }

  async findOneByName(name: string): Promise<ConditionDocument | null> {
    return await this.conditionModel
      .findOne({
        name,
      })
      .exec()
  }

  async findOneById(id: string): Promise<ConditionDocument> {
    return await this.conditionModel.findById(id).exec()
  }

  async findAll(): Promise<ConditionDocument[] | null> {
    return await this.conditionModel.find({ deleted_at: null }).exec()
  }

  async updateConditionById(
    id: string,
    userId: string,
    updateConditionDto: UpdateConditionDto,
  ): Promise<ConditionDocument> {
    return await this.conditionModel
      .findByIdAndUpdate(
        id,
        { ...updateConditionDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteConditionById(
    id: string,
    userId: string,
  ): Promise<ConditionDocument> {
    return await this.conditionModel
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
    updateConditionDto: UpdateConditionDto,
  ): Promise<ConditionDocument> {
    return await this.conditionModel
      .findByIdAndUpdate(
        id,
        {
          ...updateConditionDto,
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
