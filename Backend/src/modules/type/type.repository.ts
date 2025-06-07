import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Type, TypeDocument } from './schemas/type.schema'
import { CreateTypeDto } from './dto/createType.dto'
import { UpdateTypeDto } from './dto/updateType.dto'
import { ITypeRepository } from './interfaces/itype.repository'

@Injectable()
export class TypeRepository implements ITypeRepository {
  constructor(
    @InjectModel(Type.name)
    private typeModel: Model<TypeDocument>,
  ) {}

  async create(
    createTypeDto: CreateTypeDto,
    userId: string,
  ): Promise<TypeDocument> {
    const newType = new this.typeModel({
      ...createTypeDto,
      created_at: new Date(),
      created_by: userId,
    })
    return await newType.save()
  }

  async findAll(): Promise<TypeDocument[]> {
    return this.typeModel.find({ deleted_at: null }).exec()
  }

  async findById(id: string): Promise<TypeDocument | null> {
    return this.typeModel.findOne({ _id: id, deleted_at: null }).exec()
  }

  async update(
    id: string,
    updateTypeDto: UpdateTypeDto,
    userId: string,
  ): Promise<TypeDocument | null> {
    return this.typeModel
      .findByIdAndUpdate(
        id,
        { ...updateTypeDto, updated_at: new Date(), updated_by: userId },
        { new: true },
      )
      .exec()
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.typeModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
    return !!result
  }

  async findTypeByName(name: string): Promise<TypeDocument | null> {
    return this.typeModel.findOne({ name, deleted_at: null }).exec()
  }
}
