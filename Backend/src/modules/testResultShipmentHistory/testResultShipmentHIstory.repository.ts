import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import {
  TestResultShipmentHistory,
  TestResultShipmentHistoryDocument,
} from './schemas/TestResultShipmentHistory.schema'
import { ITestResultShipmentHistoryRepository } from './interfaces/iTestResultShipmentHistory.repository'

@Injectable()
export class TestResultShipmentHistoryRepository
  implements ITestResultShipmentHistoryRepository
{
  constructor(
    @InjectModel(TestResultShipmentHistory.name)
    private testResultShipmentHistoryModel: Model<TestResultShipmentHistoryDocument>,
  ) {}

  async createTestResultShipmentHistory(
    shipmentStatus: string,
    testResultShipment: string,
    accountId: string,
    shipperId: string,
  ): Promise<TestResultShipmentHistoryDocument> {
    const createdTestResultShipmentHistory =
      new this.testResultShipmentHistoryModel({
        shipmentStatus: new mongoose.Types.ObjectId(shipmentStatus),
        testResultShipment: new mongoose.Types.ObjectId(testResultShipment),
        account: new mongoose.Types.ObjectId(accountId),
        shipperId: new mongoose.Types.ObjectId(accountId),
        createdAt: new Date(),
      })
    return createdTestResultShipmentHistory.save()
  }

  findAllTestResultShipmentHistory(
    filter: Record<string, unknown>,
  ): mongoose.Query<
    TestResultShipmentHistoryDocument[],
    TestResultShipmentHistoryDocument
  > {
    return this.testResultShipmentHistoryModel
      .find(filter)
      .populate({
        path: 'ShipmentStatus',
        select: 'shipmentStatus -_id',
      })
      .populate({
        path: 'TestResultShipment',
        select: 'testResultDispatchedDate testResultDeliveryDate -_id',
      })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.testResultShipmentHistoryModel.countDocuments(filter).exec()
  }
}
