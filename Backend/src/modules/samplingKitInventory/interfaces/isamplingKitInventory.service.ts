import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateSamplingKitInventoryDto } from '../dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from '../dto/samplingKitInventoryResponse.dto'
import { UpdateInventoryDto } from '../dto/updateInventory.dto'

export interface ISamplingKitInventoryService {
  create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto>

  findById(id: string): Promise<SamplingKitInventoryResponseDto>

  update(
    id: string,
    facilityId: string,
    userId: string,
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<SamplingKitInventoryResponseDto>

  findByLotNumberAndFacility(
    lotNumber: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto | null>

  findAll(
    facilityId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<SamplingKitInventoryResponseDto>>

  delete(
    id: string,
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto | null>

  deleteExpiredSamplingKits(): Promise<void>
}

export const ISamplingKitInventoryService = Symbol(
  'ISamplingKitInventoryService',
)
