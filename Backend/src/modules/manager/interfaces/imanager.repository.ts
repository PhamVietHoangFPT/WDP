import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import { KitShipment, KitShipmentDocument } from 'src/modules/KitShipment/schemas/kitShipment.schema'
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

  assignDeliveryStaffToKitShipment(
    kitShipmentId: string,
    deliveryStaffId: string,
    userId: string,
  ): Promise<KitShipmentDocument>

  getAllSampleCollectors(facilityId: string): Promise<AccountDocument[]>
  getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
    isAtHome: boolean,
    bookingDate: string,
  ): Promise<ServiceCase[]>

  getAllKitShipmentWithoutDeliveryStaff(
    facilityId: string,
    bookingDate: string,
  ): Promise<KitShipment[]>

  managerCreateAccount(
    accountData: Partial<AccountDocument>,
    userId: string,
    facilityId: string,
  ): Promise<AccountDocument>
  managerGetAllRoles(): Promise<RoleDocument[]>
  getAllServiceCaseWithoutDoctor(
    facilityId: string,
    bookingDate: string,
  ): Promise<ServiceCase[]>
  assignDoctorToServiceCase(
    serviceCaseId: string,
    doctorId: string,
    userId: string,
  ): Promise<ServiceCaseDocument>
  getAllDoctors(facilityId: string): Promise<AccountDocument[]>
  getAllDeliveryStaff(facilityId: string): Promise<AccountDocument[]>
}

export const IManagerRepository = Symbol('IManagerRepository')
