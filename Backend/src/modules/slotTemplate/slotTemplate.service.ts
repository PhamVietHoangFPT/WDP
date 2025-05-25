import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  // InternalServerErrorException,
  // BadRequestException,
  // HttpException,
} from '@nestjs/common'
// import { Types } from 'mongoose'

import { ISlotTemplateRepository } from './interfaces/islotTemplate.repository'
import { ISlotTemplateService } from './interfaces/islotTemplate.service'
import { CreateSlotTemplateDto } from './dto/createSlotTemplate.dto'
import { SlotTemplateResponseDto } from './dto/slotTemplateResponse.dto'
import { SlotTemplate } from './schemas/slotTemplate.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

@Injectable()
export class SlotTemplateService implements ISlotTemplateService {
  constructor(
    @Inject(ISlotTemplateRepository)
    private readonly slotTemplateRepository: ISlotTemplateRepository, // <-- Thay đổi cách inject
  ) {}

  private mapToResponseDto(
    slotTemplate: SlotTemplate,
  ): SlotTemplateResponseDto {
    return new SlotTemplateResponseDto({
      _id: slotTemplate._id,
      isSunday: slotTemplate.isSunday,
      workTimeStart: slotTemplate.workTimeStart,
      workTimeEnd: slotTemplate.workTimeEnd,
      slotDuration: slotTemplate.slotDuration,
      facility: slotTemplate.facility,
    })
  }

  async findAllSlotTemplates(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<SlotTemplateResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}
    // Fetch users and total count in parallel
    const [slotTemplates, totalItems] = await Promise.all([
      this.slotTemplateRepository
        .findWithQuery(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.slotTemplateRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = slotTemplates.map((slotTemplate: SlotTemplate) =>
      this.mapToResponseDto(slotTemplate),
    )
    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async findSlotTemplateById(id: string): Promise<SlotTemplateResponseDto> {
    const slotTemplate = await this.slotTemplateRepository.findById(id) // Sử dụng repo đã inject
    if (!slotTemplate) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ với ID "${id}".`,
      )
    }
    return this.mapToResponseDto(slotTemplate)
  }

  async createSlotTemplate(
    createSlotTemplateDto: CreateSlotTemplateDto,
    userId: string,
  ): Promise<any> {
    const isExistAndNotDeleted =
      await this.slotTemplateRepository.checkExistByFacilityAndNotDeleted(
        createSlotTemplateDto,
      )
    if (isExistAndNotDeleted) {
      throw new ConflictException(`Mẫu khung giờ đã tồn tại cho cơ sở trên`)
    }

    const newSlotTemplate = await this.slotTemplateRepository.create(
      {
        ...createSlotTemplateDto,
        isSunday: false,
      },
      userId,
    )
    const newSlotTemplateSunday = await this.slotTemplateRepository.create(
      {
        ...createSlotTemplateDto,
        isSunday: true,
      },
      userId,
    )

    const newSlotTemplateResponse = this.mapToResponseDto(newSlotTemplate)
    const newSlotTemplateSundayResponse = this.mapToResponseDto(
      newSlotTemplateSunday,
    )

    return {
      normal: newSlotTemplateResponse,
      sunday: newSlotTemplateSundayResponse,
    }
  }

  async updateSlotTemplate(
    id: string,
    updateSlotTemplateDto: Partial<SlotTemplate>,
    userId: string,
  ): Promise<SlotTemplateResponseDto> {
    const updatedSlotTemplate =
      await this.slotTemplateRepository.findByIdAndUpdate(
        id,
        updateSlotTemplateDto,
        userId,
      )
    if (!updatedSlotTemplate) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ với ID "${id}".`,
      )
    }
    return this.mapToResponseDto(updatedSlotTemplate)
  }

  async deleteSlotTemplate(id: string, userId: string): Promise<void> {
    const deletedSlotTemplate = await this.slotTemplateRepository.delete(
      id,
      userId,
    )
    const isDeleted = await this.slotTemplateRepository.checkDeleted(id)
    if (isDeleted) {
      throw new ConflictException(
        `Mẫu khung giờ với ID "${id}" đã được xóa trước đó.`,
      )
    }
    if (!deletedSlotTemplate) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ với ID "${id}".`,
      )
    }
  }

  async findSlotByFacilityId(facilityId: string): Promise<any> {
    const slotTemplates =
      await this.slotTemplateRepository.findByFacilityId(facilityId)
    if (!slotTemplates || slotTemplates.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ cho cơ sở với ID "${facilityId}".`,
      )
    }
    return slotTemplates.map((slotTemplate) =>
      this.mapToResponseDto(slotTemplate),
    )
  }
}
