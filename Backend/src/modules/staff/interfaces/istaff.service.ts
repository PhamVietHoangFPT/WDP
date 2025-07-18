import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'

export interface IStaffService {
  getServiceCasesByCustomerEmail(
    facilityId: string,
    email: string,
    currentStatus: string,
  ): Promise<ServiceCaseResponseDto[]>
}
export const IStaffService = 'IStaffService'
