import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from './schemas/testRequestStatus.schema'
import { ITestRequestStatusRepository } from './interfaces/itestRequestStatus.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class TestRequestStatusRepository
  implements ITestRequestStatusRepository
{
  constructor(
    @InjectModel(TestRequestStatus.name)
    private readonly model: Model<TestRequestStatusDocument>,
  ) {}

  async getAll(): Promise<TestRequestStatusDocument[]> {
    return this.model.find().select('_id testRequestStatus').exec()
  }

  async findById(id: string): Promise<TestRequestStatusDocument | null> {
    return this.model.findById(id).select('_id testRequestStatus').exec()
  }

  async findByTestRequestStatus(
    name: string,
  ): Promise<TestRequestStatusDocument | null> {
    return this.model
      .findOne({ testRequestStatus: name })
      .select('_id testRequestStatus')
      .exec()
  }
}
