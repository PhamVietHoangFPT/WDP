import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { ISampleCollectorService } from './interfaces/isampleCollector.service'
import { ISampleCollectorRepository } from './interfaces/isampleCollector.repository'
import { TestRequestStatusDocument } from '../testRequestStatus/schemas/testRequestStatus.schema'
import { ServiceCaseDocument } from '../serviceCase/schemas/serviceCase.schema'

@Injectable()
export class SampleCollectorService implements ISampleCollectorService {
  constructor(
    @Inject(ISampleCollectorRepository)
    private readonly sampleCollectorRepository: ISampleCollectorRepository,
  ) {}
  async getAllServiceCaseForSampleCollector(
    sampleCollectorId: string,
    serviceCaseStatus: string,
  ): Promise<ServiceCaseDocument[]> {
    const data =
      await this.sampleCollectorRepository.getAllServiceCaseForSampleCollector(
        sampleCollectorId,
        serviceCaseStatus,
      )
    if (!data || data.length === 0) {
      throw new NotFoundException('Không tìm thấy trường hợp dịch vụ nào')
    }
    return data
  }
  async getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  > {
    return this.sampleCollectorRepository.getAllServiceCaseStatusForSampleCollector()
  }
}
