import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'

export interface ISampleCollectorService {
  getAllServiceCaseForSampleCollector(
    sampleCollectorId: string,
    serviceCaseStatus: string,
  ): Promise<ServiceCaseDocument[]>
  getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  >
}

export const ISampleCollectorService = Symbol('ISampleCollectorService')
