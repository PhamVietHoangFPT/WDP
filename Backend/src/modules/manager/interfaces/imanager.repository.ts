import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import {
  ServiceCase,
  ServiceCaseDocument,
} from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface IManagerRepository {
  assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<ServiceCaseDocument>
  getAllSampleCollectors(facilityId: string): Promise<AccountDocument[]>
  getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
    isAtHome: boolean,
  ): Promise<ServiceCase[]>
}

export const IManagerRepository = Symbol('IManagerRepository')
