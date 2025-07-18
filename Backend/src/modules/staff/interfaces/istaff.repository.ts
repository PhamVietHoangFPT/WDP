import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface IStaffRepository {
  getServiceCasesByCustomerEmail(
    facilityId: string,
    email: string,
    currentStatus: string,
  ): Promise<ServiceCaseDocument[]>
}

export const IStaffRepository = 'IStaffRepository'
