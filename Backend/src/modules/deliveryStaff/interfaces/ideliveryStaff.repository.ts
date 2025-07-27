import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'
export interface IDeliveryStaffRepository {
  findAllServiceCasesByDeliveryStaffId(
    deliveryStaffId: string,
    currentStatus: string,
  ): Promise<ServiceCaseDocument[]>
}

export const IDeliveryStaffRepository = Symbol('IDeliveryStaffRepository')
