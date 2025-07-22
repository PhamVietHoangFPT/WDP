import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { TestResultShipmentHistoryDocument } from '../schemas/TestResultShipmentHistory.schema'

export interface ITestResultShipmentHistoryService {
  findAllTestResultShipmentHistory(
    pageNumber: number,
    pageSize: number,
    accountId: string,
    shipperId: string,
  ): Promise<PaginatedResponse<TestResultShipmentHistoryDocument>>
}

export const ITestResultShipmentHistoryService = Symbol(
  'ITestResultShipmentHistoryService',
)
