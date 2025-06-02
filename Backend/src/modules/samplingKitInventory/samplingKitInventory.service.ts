import { Injectable, Inject, NotFoundException } from '@nestjs/common'

import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from './dto/samplingKitInventoryResponse.dto'
import { SamplingKitInventory } from './schemas/samplingKitInventory.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

@Injectable()
export class SamplingKitInventoryService
  implements ISamplingKitInventoryService
{
  constructor(
    @Inject(ISamplingKitInventoryRepository)
    private readonly samplingKitInventoryRepository: ISamplingKitInventoryRepository,
  ) {}

  private mapToResponseDto(
    samplingKitInventory: SamplingKitInventory,
  ): SamplingKitInventoryResponseDto {
    return new SamplingKitInventoryResponseDto(samplingKitInventory)
  }

  async create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto> {
    const newSamplingKitInventory =
      await this.samplingKitInventoryRepository.create(
        createSamplingKitInventoryDto,
        facilityId,
      )
    return this.mapToResponseDto(newSamplingKitInventory)
  }

  async findById(
    id: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto> {
    const samplingKitInventory =
      await this.samplingKitInventoryRepository.findById(id, facilityId)
    if (!samplingKitInventory) {
      throw new NotFoundException(`Mẫu kit không tồn tại`)
    }
    return this.mapToResponseDto(samplingKitInventory)
  }

  async update(
    id: string,
    facilityId: string,
    userId: string,
    updateSamplingKitInventoryDto: Partial<SamplingKitInventory>,
  ): Promise<SamplingKitInventoryResponseDto> {
    const updatedSamplingKitInventory =
      await this.samplingKitInventoryRepository.update(
        id,
        facilityId,
        userId,
        updateSamplingKitInventoryDto,
      )
    if (!updatedSamplingKitInventory) {
      throw new NotFoundException(`Mẫu kit không tồn tại`)
    }
    return this.mapToResponseDto(updatedSamplingKitInventory)
  }

  async findByLotNumberAndFacility(
    lotNumber: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto | null> {
    const samplingKitInventory =
      await this.samplingKitInventoryRepository.findByLotNumberAndFacility(
        lotNumber,
        facilityId,
      )
    if (!samplingKitInventory) {
      return null
    }
    return this.mapToResponseDto(samplingKitInventory)
  }

  async findAll(
    facilityId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<SamplingKitInventoryResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}

    const [sampling, totalItems] = await Promise.all([
      this.samplingKitInventoryRepository
        .findAllByFacility(facilityId, filter)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.samplingKitInventoryRepository.countDocuments(filter, facilityId),
    ])
    const totalPages = Math.ceil(totalItems / pageSize)
    const paginatedItems = sampling.slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize,
    )
    return {
      data: paginatedItems.map((kit) => this.mapToResponseDto(kit)),
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async delete(
    id: string,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto | null> {
    const deletedSamplingKitInventory =
      await this.samplingKitInventoryRepository.delete(id, facilityId, userId)
    if (!deletedSamplingKitInventory) {
      return null
    }
    return this.mapToResponseDto(deletedSamplingKitInventory)
  }
}
