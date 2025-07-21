import mongoose from 'mongoose'
import { TestResultShipmentHistoryDocument } from '../schemas/testResultShipmentHIstory.schema'

export interface ITestResultShipmentHistoryRepository {
    createTestResultShipmentHistory(
        serviceCaseId: string,
        TestResultShipmentStatusId: string,
        accountId: string,
        shipperId?: string,
    ): Promise<TestResultShipmentHistoryDocument>

    findAllTestResultShipmentHistory(
        filter: Record<string, unknown>,
    ): mongoose.Query<TestResultShipmentHistoryDocument[], TestResultShipmentHistoryDocument>

    countDocuments(filter: Record<string, unknown>): Promise<number>
}

export const ITestResultShipmentHistoryRepository = Symbol(
    'ITestResultShipmentHistoryRepository',
)
