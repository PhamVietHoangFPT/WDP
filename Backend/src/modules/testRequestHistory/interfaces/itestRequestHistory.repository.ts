import mongoose from 'mongoose'
import { TestRequestHistoryDocument } from '../schemas/testRequestHistory.schema'

export interface ITestRequestHistoryRepository {
  createTestRequestHistory(
    serviceCaseId: string,
    testRequestStatusId: string,
    accountId: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
  ): Promise<TestRequestHistoryDocument>

  findAllTestRequestHistory(
    filter: Record<string, unknown>,
  ): mongoose.Query<TestRequestHistoryDocument[], TestRequestHistoryDocument>

  countDocuments(filter: Record<string, unknown>): Promise<number>
}

export const ITestRequestHistoryRepository = Symbol(
  'ITestRequestHistoryRepository',
)
