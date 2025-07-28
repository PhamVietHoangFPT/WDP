import { Injectable, Inject } from '@nestjs/common'
import { IKitShipmentHistoryRepository } from './interfaces/iKitShipmentHistory.repository'
import { IKitShipmentHistoryService } from './interfaces/iKitShipmentHistory.service'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { KitShipmentHistoryDocument } from './schemas/KitShipmentHistory.schema'

@Injectable()
export class KitShipmentHistoryService implements IKitShipmentHistoryService {
  constructor(
    @Inject(IKitShipmentHistoryRepository)
    private readonly KitShipmentHistoryRepository: IKitShipmentHistoryRepository,
  ) { }
  async findAllKitShipmentHistory(
    pageNumber: number,
    pageSize: number,
    customerId: string,
    kitShipmentId: string,
  ): Promise<PaginatedResponse<KitShipmentHistoryDocument>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {
      customer: customerId,
      ...(kitShipmentId && { kitShipment: kitShipmentId }),
    }
    const [KitShipmentHistories, totalItems] = await Promise.all([
      this.KitShipmentHistoryRepository.findAllKitShipmentHistory(filter)
        .skip(skip)
        .limit(pageSize),
      this.KitShipmentHistoryRepository.countDocuments(filter),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: KitShipmentHistories,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }
}
