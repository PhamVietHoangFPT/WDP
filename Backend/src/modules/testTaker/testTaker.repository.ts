import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { TestTaker, TestTakerDocument } from './schemas/testTaker.schema'
import { ITestTakerRepository } from './interfaces/itestTaker.repository'
import { CreateTestTakerDto } from './dto/createTestTaker.dto'
import { QueryTestTakerDto } from './dto/queryTestTaker.dto'

@Injectable()
export class TestTakerRepository implements ITestTakerRepository {
  constructor(
    @InjectModel(TestTaker.name)
    private readonly testTakerModel: Model<TestTakerDocument>,
  ) {}

  async create(dto: CreateTestTakerDto): Promise<TestTaker> {
    const created = new this.testTakerModel(dto)
    return await created.save()
  }

  async findById(id: string): Promise<TestTaker | null> {
    return this.testTakerModel
      .findById(id)
      .populate({ path: 'account', select: 'name email' }) // Populate account info if needed
      .lean()
      .exec()
  }

  async findAll(
    queryDto: QueryTestTakerDto,
    skip: number,
    limit: number,
  ): Promise<TestTaker[]> {
    const filter: any = {}

    if (queryDto.name) {
      filter.name = { $regex: queryDto.name, $options: 'i' }
    }

    if (queryDto.personalId) {
      filter.personalId = queryDto.personalId
    }

    if (queryDto.gender !== undefined) {
      filter.gender = queryDto.gender
    }

    if (queryDto.dateOfBirth) {
      filter.dateOfBirth = new Date(queryDto.dateOfBirth)
    }

    if (queryDto.accountId && Types.ObjectId.isValid(queryDto.accountId)) {
      filter.accountId = new Types.ObjectId(queryDto.accountId)
    }

    return this.testTakerModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })
      .populate({ path: 'account', select: 'name email' })
      .lean()
      .exec()
  }

  async countAll(queryDto: QueryTestTakerDto): Promise<number> {
    const filter: any = {}

    if (queryDto.name) {
      filter.name = { $regex: queryDto.name, $options: 'i' }
    }

    if (queryDto.personalId) {
      filter.personalId = queryDto.personalId
    }

    if (queryDto.gender !== undefined) {
      filter.gender = queryDto.gender
    }

    if (queryDto.dateOfBirth) {
      filter.dateOfBirth = new Date(queryDto.dateOfBirth)
    }

    if (queryDto.accountId && Types.ObjectId.isValid(queryDto.accountId)) {
      filter.accountId = new Types.ObjectId(queryDto.accountId)
    }

    return this.testTakerModel.countDocuments(filter).exec()
  }

  async update(
    id: string,
    updateData: Partial<CreateTestTakerDto>,
  ): Promise<TestTaker | null> {
    return this.testTakerModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec()
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.testTakerModel
      .deleteOne({ _id: id })
      .lean()
      .exec()
    return result.deletedCount > 0
  }
}
