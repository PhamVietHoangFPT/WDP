import {
  Injectable,
  Inject,
  NotFoundException,
  Logger,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common'

import { ISamplingKitInventoryRepository } from './interfaces/isamplingKitInventory.repository'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from './dto/samplingKitInventoryResponse.dto'
import { SamplingKitInventory } from './schemas/samplingKitInventory.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { ISampleRepository } from '../sample/interfaces/isample.repository'
import { Cron, CronExpression } from '@nestjs/schedule'
import { UpdateInventoryDto } from './dto/updateInventory.dto'
import { isMongoId } from 'class-validator'
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
      deleted_at: samplingKitInventory.deleted_at,
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

    try {
      const newSamplingKitInventory =
        await this.samplingKitInventoryRepository.create(
          createSamplingKitInventoryDto,
          facilityId,
          userId,
        )
      return this.mapToResponseDto(newSamplingKitInventory)
    } catch (error) {
      if (error.code === 11000) {
        // Nếu đúng, ném ra lỗi ConflictException với thông báo rõ ràng
        this.logger.error(`Lỗi khi tạo mẫu kit: ${error.message}`, error.stack)
        throw new ConflictException(
          `Mã mẫu kit này đã tồn tại. Vui lòng chọn một mã khác.`,
        )
      }

      // Đối với tất cả các lỗi khác không xác định, ném ra lỗi chung
      // để tránh lộ chi tiết kỹ thuật không cần thiết.
      throw new InternalServerErrorException(
        `Đã có lỗi xảy ra khi tạo mẫu kit.`,
      )
    }
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
    updateInventoryDto: UpdateInventoryDto,
  ): Promise<SamplingKitInventoryResponseDto> {
    const updatedSamplingKitInventory =
      await this.samplingKitInventoryRepository.update(
        id,
        facilityId,
        userId,
        updateInventoryDto,
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
    sampleId?: string,
  ): Promise<PaginatedResponse<SamplingKitInventoryResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {
      facility: facilityId,
      deleted_at: null,
      sample: sampleId ? sampleId : { $exists: true },
    }

    const [sampling, totalItems] = await Promise.all([
      this.samplingKitInventoryRepository
        .findAllByFacility(facilityId, filter)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.samplingKitInventoryRepository.countDocuments(filter, facilityId),
    ])
    const totalPages = Math.ceil(totalItems / pageSize)

    return {
      data: sampling.map((kit) => this.mapToResponseDto(kit)),
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

  async findAllExpiredKits(
    facilityId: string,
    pageNumber: number,
    pageSize: number,
    sampleId?: string,
  ): Promise<PaginatedResponse<SamplingKitInventoryResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {
      facility: facilityId,
      delete_at: { $exists: true },
      sample: sampleId ? sampleId : { $exists: true },
    }
    const [sampling, totalItems] = await Promise.all([
      this.samplingKitInventoryRepository
        .findAllExpiredKits(facilityId, filter)
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.samplingKitInventoryRepository.countDocuments(filter, facilityId),
    ])
    const totalPages = Math.ceil(totalItems / pageSize)
    return {
      data: sampling.map((kit) => this.mapToResponseDto(kit)),
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async findBySampleIdAndFacilityId(
    sampleId: string,
    facilityId: string,
  ): Promise<SamplingKitInventoryResponseDto | null> {
    if (!isMongoId(sampleId) || !isMongoId(facilityId)) {
      throw new BadRequestException(`ID mẫu kit hoặc ID cơ sở không hợp lệ.`)
    }
    const samplingKitInventory =
      await this.samplingKitInventoryRepository.findBySampleIdAndFacilityId(
        sampleId,
        facilityId,
      )
    if (!samplingKitInventory) {
      throw new NotFoundException(`Mẫu kit không còn đủ trong kho.`)
    }
    return this.mapToResponseDto(samplingKitInventory)
  }
}
