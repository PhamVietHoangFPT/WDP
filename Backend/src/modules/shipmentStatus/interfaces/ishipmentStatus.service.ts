import { ShipmentStatusResponseDto } from "../dto/shipmentStatusResponse.dto"

export interface IShipmentStatusService {
    findAllShipmentStatus(): Promise<ShipmentStatusResponseDto[]>
    findShipmentStatusById(id: string): Promise<ShipmentStatusResponseDto>
}

export const IShipmentStatusService = Symbol('IShipmentStatusService')
