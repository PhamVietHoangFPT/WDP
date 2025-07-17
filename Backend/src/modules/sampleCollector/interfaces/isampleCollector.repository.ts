import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'
export interface ISampleCollectorRepository {
  getAllServiceCaseForSampleCollector(
    sampleCollectorId: string,
    serviceCaseStatus: string,
    isAtHome: boolean,
  ): Promise<ServiceCaseDocument[]>
  getAllServiceCaseStatusForSampleCollector(): Promise<
    TestRequestStatusDocument[]
  >
}

export const ISampleCollectorRepository = Symbol('ISampleCollectorRepository')
