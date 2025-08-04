import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { KitShipmentHistoryDocument } from '../schemas/KitShipmentHistory.schema'

export interface IKitShipmentHistoryService {
  findAllKitShipmentHistory(
    pageNumber: number,
    pageSize: number,
    customerId: string,
    caseMember: string,
  ): Promise<PaginatedResponse<KitShipmentHistoryDocument>>
}

export const IKitShipmentHistoryService = Symbol('IKitShipmentHistoryService')
