import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { TestRequestHistoryDocument } from '../schemas/testRequestHistory.schema'

export interface ITestRequestHistoryService {
  findAllTestRequestHistory(
    pageNumber: number,
    pageSize: number,
    accountId: string,
    serviceCaseId: string,
  ): Promise<PaginatedResponse<TestRequestHistoryDocument>>
}

export const ITestRequestHistoryService = Symbol('ITestRequestHistoryService')
