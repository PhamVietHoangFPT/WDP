import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { ITestRequestStatusService } from './interfaces/itestRequestStatus.service'
import { TestRequestStatusDocument } from './schemas/testRequestStatus.schema'
import { ITestRequestStatusRepository } from './interfaces/itestRequestStatus.repository'

@Injectable()
export class TestRequestStatusService implements ITestRequestStatusService {
  constructor(
    @Inject(ITestRequestStatusRepository)
    private readonly testRequestStatusRepository: ITestRequestStatusRepository,
  ) {}

  async getAll(): Promise<TestRequestStatusDocument[]> {
    return this.testRequestStatusRepository.getAll()
  }

  async findById(id: string): Promise<TestRequestStatusDocument> {
    const testRequestStatus =
      await this.testRequestStatusRepository.findById(id)
    if (!testRequestStatus) {
      throw new NotFoundException(`Trạng thái yêu cầu kiểm tra không tồn tại`)
    }
    return testRequestStatus
  }

  async findByTestRequestStatus(
    name: string,
  ): Promise<TestRequestStatusDocument | null> {
    return this.testRequestStatusRepository.findByTestRequestStatus(name)
  }
}
