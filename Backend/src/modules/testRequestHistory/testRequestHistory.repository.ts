import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  TestRequestHistory,
  TestRequestHistoryDocument,
} from './schemas/testRequestHistory.schema'
import { ITestRequestHistoryRepository } from './interfaces/itestRequestHistory.repository'

@Injectable()
export class TestRequestHistoryRepository
  implements ITestRequestHistoryRepository
{
  constructor(
    @InjectModel(TestRequestHistory.name)
    private testRequestHistoryModel: Model<TestRequestHistoryDocument>,
  ) {}

  async createTestRequestHistory(
    serviceCaseId: string,
    testRequestStatusId: string,
    accountId: string,
  ): Promise<TestRequestHistoryDocument> {
    const createdTestRequestHistory = new this.testRequestHistoryModel({
      serviceCase: new mongoose.Types.ObjectId(serviceCaseId),
      testRequestStatus: new mongoose.Types.ObjectId(testRequestStatusId),
      account: new mongoose.Types.ObjectId(accountId),
      createdAt: new Date(),
    })
    return createdTestRequestHistory.save()
  }

  findAllTestRequestHistory(
    filter: Record<string, unknown>,
  ): mongoose.Query<TestRequestHistoryDocument[], TestRequestHistoryDocument> {
    return this.testRequestHistoryModel
      .find(filter)
      .select('_id testRequestStatus created_at')
      .populate({
        path: 'testRequestStatus',
        select: 'testRequestStatus order -_id',
      })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.testRequestHistoryModel.countDocuments(filter).exec()
  }
}
