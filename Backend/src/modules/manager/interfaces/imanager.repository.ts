import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import { ServiceCase } from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface IManagerRepository {
  assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<void>
  getAllSampleCollectors(facilityId: string): Promise<AccountDocument[]>
  getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
  ): Promise<ServiceCase[]>
}

export const IManagerRepository = Symbol('IManagerRepository')
