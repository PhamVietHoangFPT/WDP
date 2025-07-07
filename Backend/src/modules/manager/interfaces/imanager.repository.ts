import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import { RoleDocument } from 'src/modules/role/schemas/role.schema'
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
  managerCreateAccount(
    accountData: Partial<AccountDocument>,
    userId: string,
    facilityId: string,
  ): Promise<AccountDocument>
  managerGetAllRoles(): Promise<RoleDocument[]>
  getAllServiceCaseWithoutDoctor(facilityId: string): Promise<ServiceCase[]>
  assignDoctorToServiceCase(
    serviceCaseId: string,
    doctorId: string,
    userId: string,
  ): Promise<ServiceCaseDocument>
  getAllDoctors(facilityId: string): Promise<AccountDocument[]>
}

export const IManagerRepository = Symbol('IManagerRepository')
