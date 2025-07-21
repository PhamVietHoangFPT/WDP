import { Injectable, Inject } from '@nestjs/common'
import { ITestResultShipmentHistoryRepository } from './interfaces/iTestResultShipmentHistory.repository'
import { ITestResultShipmentHistoryService } from './interfaces/iTestResultShipmentHistory.service'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { TestResultShipmentHistoryDocument } from './schemas/TestResultShipmentHistory.schema'

@Injectable()
export class TestResultShipmentHistoryService implements ITestResultShipmentHistoryService {
    constructor(
        @Inject(ITestResultShipmentHistoryRepository)
        private readonly testResultShipmentHistoryRepository: ITestResultShipmentHistoryRepository,
    ) { }
    async findAllTestResultShipmentHistory(
        pageNumber: number,
        pageSize: number,
        accountId: string,
    ): Promise<PaginatedResponse<TestResultShipmentHistoryDocument>> {
        const skip = (pageNumber - 1) * pageSize
        const filter = {
            account: accountId,
        }
        const [TestResultShipmentHistories, totalItems] = await Promise.all([
            this.testResultShipmentHistoryRepository
                .findAllTestResultShipmentHistory(filter)
                .skip(skip)
                .limit(pageSize),
            this.testResultShipmentHistoryRepository.countDocuments(filter),
        ])

        const totalPages = Math.ceil(totalItems / pageSize)

        return {
            data: TestResultShipmentHistories,
            pagination: {
                totalItems,
                totalPages,
                currentPage: pageNumber,
                pageSize,
            },
        }
    }
}
