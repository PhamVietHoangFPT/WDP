import { Injectable } from '@nestjs/common'
import { IRelationshipRepository } from './interfaces/irelationship.repository'
import {
  Relationship,
  RelationshipDocument,
} from './schemas/relationship.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CreateRelationshipDto } from './dto/createRelationship.dto'
import { UpdateRelationshipDto } from './dto/updateRelationship.dto'
@Injectable()
export class RelationshipRepository implements IRelationshipRepository {
  constructor(
    @InjectModel(Relationship.name)
    private relationshipModel: Model<RelationshipDocument>,
  ) {}

  async create(
    userId: string,
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<RelationshipDocument> {
    const newRelationship = new this.relationshipModel({
      ...createRelationshipDto,
      created_by: userId,
      created_at: new Date(),
    })
    return await newRelationship.save()
  }

  async findOneByName(name: string): Promise<RelationshipDocument | null> {
    return await this.relationshipModel
      .findOne({
        name,
      })
      .exec()
  }

  async findOneById(id: string): Promise<RelationshipDocument | null> {
    return await this.relationshipModel.findById(id).exec()
  }

  async findAll(): Promise<RelationshipDocument[] | null> {
    return await this.relationshipModel.find({ deleted_at: null }).exec()
  }

  async updateRelationshipById(
    id: string,
    userId: string,
    updateRelationshipDto: UpdateRelationshipDto,
  ): Promise<RelationshipDocument> {
    return await this.relationshipModel
      .findByIdAndUpdate(
        id,
        {
          ...updateRelationshipDto,
          updated_by: userId,
          updated_at: new Date(),
        },
        { new: true },
      )
      .exec()
  }

  async deleteRelationshipById(
    id: string,
    userId: string,
  ): Promise<RelationshipDocument> {
    return await this.relationshipModel
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
    updateRelationshipDto: UpdateRelationshipDto,
  ): Promise<RelationshipDocument> {
    return await this.relationshipModel
      .findByIdAndUpdate(
        id,
        {
          ...updateRelationshipDto,
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
