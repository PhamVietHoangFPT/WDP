import { Injectable, Inject } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { IKitShipmentHistoryRepository } from './interfaces/iKitShipmentHistory.repository'
import { IKitShipmentHistoryService } from './interfaces/iKitShipmentHistory.service'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { KitShipmentHistoryDocument } from './schemas/KitShipmentHistory.schema'
import {
  KitShipment,
  KitShipmentDocument,
} from '../KitShipment/schemas/kitShipment.schema'

@Injectable()
export class KitShipmentHistoryService implements IKitShipmentHistoryService {
  constructor(
    @Inject(IKitShipmentHistoryRepository)
    private readonly KitShipmentHistoryRepository: IKitShipmentHistoryRepository,
    @InjectModel(KitShipment.name)
    private readonly kitShipmentModel: Model<KitShipmentDocument>,
  ) {}
  async findAllKitShipmentHistory(
    pageNumber: number,
    pageSize: number,
    customerId: string,
    caseMember: string,
  ): Promise<PaginatedResponse<KitShipmentHistoryDocument>> {
    const skip = (pageNumber - 1) * pageSize

    let filter: Record<string, unknown> = {
      customer: customerId,
    }

    // If caseMember is provided, find kitShipments with that caseMember first
    if (caseMember) {
      const kitShipments = await this.kitShipmentModel
        .find({ caseMember: new Types.ObjectId(caseMember) })
        .select('_id')
        .lean()

      if (kitShipments.length === 0) {
        // No kitShipments found with this caseMember, return empty result
        return {
          data: [],
          pagination: {
            totalItems: 0,
            totalPages: 0,
            currentPage: pageNumber,
            pageSize,
          },
        }
      }

      const kitShipmentIds = kitShipments.map((ks) => ks._id)
      filter.kitShipment = { $in: kitShipmentIds }
    }

    const [KitShipmentHistories, totalItems] = await Promise.all([
      this.KitShipmentHistoryRepository.findAllKitShipmentHistory(filter)
        .skip(skip)
        .limit(pageSize),
      this.KitShipmentHistoryRepository.countDocuments(filter),
    ])

    // Filter out documents where kitShipmentStatus is null (didn't match order criteria)
    const filteredHistories = KitShipmentHistories.filter(
      (history: any) => history.kitShipmentStatus !== null,
    )

    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: filteredHistories,
      pagination: {
        totalItems: filteredHistories.length,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }
}
