import { UpdateKitShipmentStatusDto } from '../dto/updateKitShipmentStatus.dto'
import { KitShipmentStatusResponseDto } from '../dto/KitShipmentStatusResponse.dto'
import { CreateKitShipmentStatusDto } from '../dto/createKitShipmentStatus.dto'

export interface IKitShipmentStatusService {
    create(
        data: CreateKitShipmentStatusDto,
        userId: string,
    ): Promise<KitShipmentStatusResponseDto>
    findAll(): Promise<KitShipmentStatusResponseDto[]>
    findById(id: string): Promise<KitShipmentStatusResponseDto | null>
    update(
        id: string,
        data: UpdateKitShipmentStatusDto,
        userId: string,
    ): Promise<KitShipmentStatusResponseDto | null>
    delete(id: string, userId: string): Promise<boolean>
}
export const IKitShipmentStatusService = Symbol('IKitShipmentStatusService')
