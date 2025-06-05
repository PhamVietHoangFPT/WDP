import { UpdateTypeDto } from './dto/update-response.dto'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ITypeRepository } from './interfaces/itype.repository'
import { Type, TypeDocument } from './schemas/type.schema'
import { CreateTypeDto } from './dto/create-type.dto'
@Injectable()
export class TypeRepository implements ITypeRepository {
  constructor(
    @InjectModel(Type.name)
    private typeModel: Model<TypeDocument>,
  ) { }

  async create(
    userId: string,
    createTypeDto: CreateTypeDto,
  ): Promise<TypeDocument> {
    const newType = new this.typeModel({
      ...createTypeDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newType.save()
  }

  async findOneByName(name: string): Promise<TypeDocument | null> {
    return this.typeModel
      .findOne({
        name,
      })
      .exec()
  }

  async findOneById(id: string): Promise<TypeDocument | null> {
    return this.typeModel.findById(id).exec()
  }

  async findAll(): Promise<TypeDocument[] | null> {
    return this.typeModel.find({ deleted_at: null }).populate({ path: "condition", select: "name" })
      .exec()
  }

  async updateTypeById(
    id: string,
    userId: string,
    updateTypeDto: UpdateTypeDto,
  ): Promise<TypeDocument> {
    return this.typeModel
      .findByIdAndUpdate(
        id,
        { ...updateTypeDto, updated_by: userId, updated_at: new Date() },
        { new: true },
      )
      .exec()
  }

  async deleteTypeById(id: string, userId: string): Promise<TypeDocument> {
    return this.typeModel
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
    updateTypeDto: UpdateTypeDto,
  ): Promise<TypeDocument> {
    return this.typeModel
      .findByIdAndUpdate(
        id,
        {
          ...updateTypeDto,
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
