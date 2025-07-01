import { AccountResponseDto } from 'src/modules/account/dto/accountResponse.dto'
import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'

export interface IManagerService {
  assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<void>
  getAllSampleCollectors(facilityId: string): Promise<AccountResponseDto[]>
  getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]>
}

export const IManagerService = Symbol('IManagerService')
