import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'

export interface ISampleCollectorService {
  getAllServiceCaseForSampleCollector(
    sampleCollectorId: string,
    serviceCaseStatus: string,
    isAtHome: boolean,
  ): Promise<ServiceCaseDocument[]>
  getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  >
  getAllServiceCasesForSampleCollector(
    sampleCollectorId: string,
    isAtHome: boolean,
  ): Promise<ServiceCaseDocument[]>
}

export const ISampleCollectorService = Symbol('ISampleCollectorService')
