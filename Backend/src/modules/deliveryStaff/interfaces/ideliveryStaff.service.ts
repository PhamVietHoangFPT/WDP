import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'

export interface IDeliveryStaffService {
  findAllServiceCasesByDeliveryStaffId(
    deliveryStaffId: string,
    currentStatus: string,
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]>
  getDeliveryStaffTestRequestStatuses(): Promise<TestRequestStatusDocument[]>
}
export const IDeliveryStaffService = Symbol('IDeliveryStaffService')
