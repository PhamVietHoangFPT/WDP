import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateSamplingKitInventoryDto } from '../dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from '../dto/samplingKitInventoryResponse.dto'
import { SamplingKitInventory } from '../schemas/samplingKitInventory.schema'

export interface ISamplingKitInventoryService {
  create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto>

  findById(
    id: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto>

  update(
    id: string,
    facilityId: string,
    userId: string,
    updateSamplingKitInventoryDto: Partial<SamplingKitInventory>,
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
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto | null>
}
