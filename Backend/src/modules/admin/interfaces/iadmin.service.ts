import { FacilityDocument } from 'src/modules/facility/schemas/facility.schema'
import { AccountDocument } from 'src/modules/account/schemas/account.schema'
import { CreateManagerDto } from '../dto/createManager.dto'
import { AccountResponseDto } from 'src/modules/account/dto/accountResponse.dto'
import { FacilityResponseDto } from 'src/modules/facility/dto/facilityResponse.dto'
export interface IAdminService {
  getAllManagers(): Promise<AccountResponseDto[]>
  createManagerAccount(
    createManagerDto: CreateManagerDto,
    userId: string,
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
  unassignManagerFromFacility(
    facilityId: string,
    managerId: string,
    userId: string,
  ): Promise<FacilityDocument | null>
  getAllFacilities(withManager: boolean): Promise<FacilityResponseDto[]>
}
export const IAdminService = Symbol('IAdminService')
