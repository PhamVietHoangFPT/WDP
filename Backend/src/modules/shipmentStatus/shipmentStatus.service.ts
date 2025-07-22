import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { isMongoId } from 'class-validator'
import { IShipmentStatusService } from './interfaces/ishipmentStatus.service'
import { IShipmentStatusRepository } from './interfaces/ishipmentStatus.repository'
import { ShipmentStatus } from './schemas/shipmentStatus.schema'
import { ShipmentStatusResponseDto } from './dto/shipmentStatusResponse.dto'

@Injectable()
export class ShipmentStatusService implements IShipmentStatusService {
  constructor(
    @Inject(IShipmentStatusRepository)
    private readonly shipmentStatusRepository: IShipmentStatusRepository,
  ) {}

  private mapToResponseDto(
    shipmentStatus: ShipmentStatus,
  ): ShipmentStatusResponseDto {
    return new ShipmentStatusResponseDto({
      _id: shipmentStatus._id,
      shipmentStatus: shipmentStatus.shipmentStatus,
    })
  }

  async findShipmentStatusById(id: string): Promise<ShipmentStatusResponseDto> {
    if (!id) {
      throw new ConflictException('ID không được để trống')
    }
    if (!isMongoId(id)) {
      throw new ConflictException('ID không hợp lệ')
    }
    const existingShipmentStatus =
      await this.shipmentStatusRepository.findOneById(id)
    if (!existingShipmentStatus) {
      throw new ConflictException('Shipment Status không tồn tại')
    }
    return this.mapToResponseDto(existingShipmentStatus)
  }

  // this function returns all Services
  // if there are no Services, it throws an ConflictException
  async findAllShipmentStatus(): Promise<ShipmentStatusResponseDto[]> {
    const shipmentStatuses = await this.shipmentStatusRepository.findAll()
    if (!shipmentStatuses || shipmentStatuses.length == 0) {
      throw new ConflictException('Không tìm thấy Shipment Status nào.')
    }
    const data = shipmentStatuses.map((shipmentStatus: ShipmentStatus) =>
      this.mapToResponseDto(shipmentStatus),
    )
    try {
      return data
    } catch (error) {
      throw new InternalServerErrorException('Failed to find Shipment Status')
    }
  }
}
