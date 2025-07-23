import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import { FacilityDocument } from 'src/modules/facility/schemas/facility.schema'

export interface IAdminRepository {
  getAllManagers(managerRoleId: string): Promise<AccountDocument[]>
  createManagerAccount(
    accountData: Partial<AccountDocument>,
    userId: string,
    managerRoleId: string,
  ): Promise<AccountDocument>
  deleteManagerAccount(
    id: string,
    userId: string,
  ): Promise<AccountDocument | null>
  assignManagerToFacility(
    managerId: string,
    facilityId: string,
    userId: string,
  ): Promise<AccountDocument | null>
  checkFacilityHasManager(facilityId: string): Promise<boolean>
  unassignManagerFromFacility(
    facilityId: string,
    managerId: string,
    userId: string,
  ): Promise<FacilityDocument | null>
  getAllFacilities(withManager: boolean): Promise<FacilityDocument[]>
}

export const IAdminRepository = Symbol('IAdminRepository')
