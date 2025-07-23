import { CreateKitShipmentStatusDto } from '../dto/createKitShipmentStatus.dto'
import { UpdateKitShipmentStatusDto } from '../dto/updateKitShipmentStatus.dto'
import { KitShipmentStatusDocument } from '../schemas/kitShipmentStatus.schema'

export interface IKitShipmentStatusRepository {
  create(
    data: CreateKitShipmentStatusDto,
    userId: string,
  ): Promise<KitShipmentStatusDocument>
  findAll(): Promise<KitShipmentStatusDocument[]>
  findById(id: string): Promise<KitShipmentStatusDocument | null>
  update(
    id: string,
    data: UpdateKitShipmentStatusDto,
    userId: string,
  ): Promise<KitShipmentStatusDocument | null>
  delete(id: string, userId: string): Promise<boolean>
  findByName(status: string): Promise<KitShipmentStatusDocument | null>
  findByOrder(order: number): Promise<KitShipmentStatusDocument | null>
  getKitShipmentStatusOrder(id: string): Promise<number | null>

}
export const IKitShipmentStatusRepository = Symbol(
  'IKitShipmentStatusRepository',
)
