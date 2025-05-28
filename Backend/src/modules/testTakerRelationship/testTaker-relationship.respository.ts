import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  TestTakerRelationship,
  TestTakerRelationshipDocument,
} from './schemas/testTakerRelationship.schema'
import { ITestTakerRelationshipRepository } from './interfaces/itestTakerRelationship.repository'

@Injectable()
export class TestTakerRelationshipRepository
  implements ITestTakerRelationshipRepository
{
  constructor(
    @InjectModel(TestTakerRelationship.name)
    private readonly relationshipModel: Model<TestTakerRelationshipDocument>,
  ) {}

  async create(
    data: Partial<TestTakerRelationship>,
  ): Promise<TestTakerRelationship> {
    const created = new this.relationshipModel({
      ...data,
      //   created_by: new mongoose.Types.ObjectId(userId),
    })
    return await created.save()
  }

  async findById(id: string): Promise<TestTakerRelationship | null> {
    return this.relationshipModel
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
        deleted_at: { $exists: false },
      })
      .exec() as Promise<TestTakerRelationship | null>
  }

  async findAll(): Promise<TestTakerRelationship[]> {
    return this.relationshipModel
      .find({ deleted_at: { $exists: false } })
      .sort({ testTakerRelationship: 1 })
      .exec() as Promise<TestTakerRelationship[]>
  }

  async find(
    filter: Record<string, unknown>,
  ): Promise<TestTakerRelationship[]> {
    return this.relationshipModel
      .find({
        ...filter,
        deleted_at: { $exists: false },
      })
      .exec() as Promise<TestTakerRelationship[]>
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<
    TestTakerRelationshipDocument[],
    TestTakerRelationshipDocument
  > {
    return this.relationshipModel
      .find({ ...filter, deleted_at: { $exists: false } })
      .sort({ generation: 1 })
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.relationshipModel
      .countDocuments({
        ...filter,
        deleted_at: { $exists: false },
      })
      .exec()
  }

  async update(
    id: string,
    updateData: Partial<TestTakerRelationship>,
    userId: string,
  ): Promise<TestTakerRelationship | null> {
    return this.relationshipModel
      .findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        {
          ...updateData,
          updated_by: new mongoose.Types.ObjectId(userId),
          updated_at: new Date(),
        },
        { new: true },
      )
      .exec() as Promise<TestTakerRelationship | null>
  }

  async delete(
    id: string,
    userId: string,
  ): Promise<TestTakerRelationship | null> {
    return this.relationshipModel
      .findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        {
          deleted_at: new Date(),
          deleted_by: new mongoose.Types.ObjectId(userId),
        },
        { new: true },
      )
      .exec() as Promise<TestTakerRelationship | null>
  }

  async checkDeleted(id: string): Promise<boolean> {
    const record = await this.relationshipModel
      .findById(new mongoose.Types.ObjectId(id))
      .exec()
    return !!record?.deleted_at
  }

  async findByIdAndUpdate(
    id: string,
    updateData: Partial<TestTakerRelationship>,
  ): Promise<TestTakerRelationship | null> {
    return this.relationshipModel
      .findByIdAndUpdate(new mongoose.Types.ObjectId(id), updateData, {
        new: true,
      })
      .exec() as Promise<TestTakerRelationship | null>
  }
}
