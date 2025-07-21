import { ShipmentStatusDocument } from "../schemas/shipmentStatus.schema"

export interface IShipmentStatusRepository {
    findOneById(id: string): Promise<ShipmentStatusDocument | null>
    findAll(): Promise<ShipmentStatusDocument[]>
}
export const IShipmentStatusRepository = Symbol('IShipmentStatusRepository')
