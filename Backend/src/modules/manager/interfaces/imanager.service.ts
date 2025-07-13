import { AccountResponseDto } from 'src/modules/account/dto/accountResponse.dto'
import { RoleDocument } from 'src/modules/role/schemas/role.schema'
import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import { ManagerCreateAccountDto } from '../dto/managerCreateAccount.dto'

export interface IManagerService {
  assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<ServiceCaseResponseDto>
  getAllSampleCollectors(facilityId: string): Promise<AccountResponseDto[]>
  getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
    isAtHome: boolean,
  ): Promise<ServiceCaseResponseDto[]>
  managerCreateAccount(
    accountData: Partial<ManagerCreateAccountDto>,
    userId: string,
    facilityId: string,
  ): Promise<AccountResponseDto>
  managerGetAllRoles(): Promise<RoleDocument[]>
  getAllServiceCaseWithoutDoctor(
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]>
  assignDoctorToServiceCase(
    serviceCaseId: string,
    doctorId: string,
    userId: string,
  ): Promise<ServiceCaseResponseDto>
  getAllDoctors(facilityId: string): Promise<AccountResponseDto[]>
  getAllDeliveryStaff(facilityId: string): Promise<AccountResponseDto[]>
}

export const IManagerService = Symbol('IManagerService')
