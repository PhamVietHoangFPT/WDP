import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateKitShipmentDto } from '../dto/createKitShipment.dto'
import { KitShipmentResponseDto } from '../dto/kitShipmentResponse.dto'
import { UpdateKitShipmentDto } from '../dto/updateKitShipment.dto'

export interface IKitShipmentService {
  createKitShipment(
    userId: string,
    createKitShipmentDto: CreateKitShipmentDto,
  ): Promise<CreateKitShipmentDto>

  findAllKitShipment(
    pageNumber: number,
    pageSize: number,
    currentStatus: string | null,
    userId: string,
  ): Promise<PaginatedResponse<KitShipmentResponseDto>>

  findKitShipmentById(id: string): Promise<KitShipmentResponseDto>
  findKitShipmentForDeliveryStaff(
    deliveryStaffId: string,
    currentStatus: string,
  ): Promise<KitShipmentResponseDto[]>
  updateKitShipment(
    id: string,
    userId: string,
    updateKitShipmentDto: UpdateKitShipmentDto,
  ): Promise<any>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
  ): Promise<KitShipmentResponseDto | null>

  deleteKitShipment(id: string, userId: string): Promise<any>
}

export const IKitShipmentService = Symbol('IKitShipmentService')
