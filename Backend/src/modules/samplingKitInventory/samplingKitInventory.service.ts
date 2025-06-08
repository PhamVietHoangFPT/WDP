import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common'

import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from './dto/samplingKitInventoryResponse.dto'
import { SamplingKitInventory } from './schemas/samplingKitInventory.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { ISampleRepository } from '../sample/interfaces/isample.repository'
import { Cron, CronExpression } from '@nestjs/schedule'
@Injectable()
export class SamplingKitInventoryService
  implements ISamplingKitInventoryService
{
  private readonly logger = new Logger(SamplingKitInventoryService.name)
  constructor(
    @Inject(ISamplingKitInventoryRepository)
    private readonly samplingKitInventoryRepository: ISamplingKitInventoryRepository,
    @Inject(ISampleRepository)
    private readonly sampleRepository: ISampleRepository,
  ) {}

  private mapToResponseDto(
    samplingKitInventory: SamplingKitInventory,
  ): SamplingKitInventoryResponseDto {
    return new SamplingKitInventoryResponseDto({
      _id: samplingKitInventory._id,
      lotNumber: samplingKitInventory.lotNumber,
      importDate: samplingKitInventory.importDate,
      expDate: samplingKitInventory.expDate,
      kitAmount: samplingKitInventory.kitAmount,
      inventory: samplingKitInventory.inventory,
      facility: samplingKitInventory.facility,
      sample: samplingKitInventory.sample,
    })
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'cleanupExpiredSamplingKits',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async deleteExpiredSamplingKits(): Promise<void> {
    this.logger.log('Bắt đầu thực hiện tác vụ xóa các mẫu kit đã hết hạn')
    const currentDate = new Date()
    const result =
      await this.samplingKitInventoryRepository.deleteByExpiredDate(currentDate)
    this.logger.log(`Đã xóa ${result} mẫu kit đã hết hạn`)
  }

  async create(
    createSamplingKitInventoryDto: CreateSamplingKitInventoryDto,
    facilityId: string,
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto> {
    const sample = await this.sampleRepository.findOneById(
      createSamplingKitInventoryDto.sample,
    )
    if (!sample) {
      throw new NotFoundException(`Loại mẫu không tồn tại`)
    }

    if (createSamplingKitInventoryDto.kitAmount <= 0) {
      throw new ConflictException(`Số lượng mẫu kit phải lớn hơn 0.`)
    }

    if (createSamplingKitInventoryDto.expDate <= new Date()) {
      throw new ConflictException(`Ngày hết hạn phải lớn hơn ngày hiện tại.`)
    }

    if (createSamplingKitInventoryDto.importDate > new Date()) {
      throw new ConflictException(`Ngày nhập khẩu phải nhỏ hơn ngày hiện tại.`)
    }

    if (
      createSamplingKitInventoryDto.importDate >
      createSamplingKitInventoryDto.expDate
    ) {
      throw new ConflictException(`Ngày nhập khẩu phải nhỏ hơn ngày hết hạn.`)
    }

    const newSamplingKitInventory =
      await this.samplingKitInventoryRepository.create(
        createSamplingKitInventoryDto,
        facilityId,
        userId,
      )
    return this.mapToResponseDto(newSamplingKitInventory)
  }

  async findById(id: string): Promise<SamplingKitInventoryResponseDto> {
    const samplingKitInventory =
      await this.samplingKitInventoryRepository.findById(id)
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
    userId: string,
  ): Promise<SamplingKitInventoryResponseDto | null> {
    const deletedSamplingKitInventory =
      await this.samplingKitInventoryRepository.delete(id, userId)
    if (!deletedSamplingKitInventory) {
      return null
    }
    return this.mapToResponseDto(deletedSamplingKitInventory)
  }
}
