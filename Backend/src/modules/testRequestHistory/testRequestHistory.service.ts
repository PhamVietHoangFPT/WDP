import { Injectable, Inject } from '@nestjs/common'
import { ITestRequestHistoryRepository } from './interfaces/itestRequestHistory.repository'
import { ITestRequestHistoryService } from './interfaces/itestRequestHistory.service'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { TestRequestHistoryDocument } from './schemas/testRequestHistory.schema'

@Injectable()
export class TestRequestHistoryService implements ITestRequestHistoryService {
  constructor(
    @Inject(ITestRequestHistoryRepository)
    private readonly testRequestHistoryRepository: ITestRequestHistoryRepository,
  ) {}
  async findAllTestRequestHistory(
    pageNumber: number,
    pageSize: number,
    accountId: string,
    serviceCaseId: string,
  ): Promise<PaginatedResponse<TestRequestHistoryDocument>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {
      account: accountId,
      ...(serviceCaseId && { serviceCase: serviceCaseId }),
    }
    const [testRequestHistories, totalItems] = await Promise.all([
      this.testRequestHistoryRepository
        .findAllTestRequestHistory(filter)
        .skip(skip)
        .limit(pageSize),
      this.testRequestHistoryRepository.countDocuments(filter),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: testRequestHistories,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }
}
