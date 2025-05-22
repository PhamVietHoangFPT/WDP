import {
  Injectable,
  Inject,
  // ConflictException,
  NotFoundException,
  // InternalServerErrorException,
  // BadRequestException,
  // HttpException,
} from '@nestjs/common'
// import { Types } from 'mongoose'

import { ISlotTemplateRepository } from './interfaces/islotTemplate.repository'
import { ISlotTemplateService } from './interfaces/islotTemplate.service'
import { CreateSlotTemplateDto } from './dto/CreateSlotTemplate.dto'
import { SlotTemplateResponseDto } from './dto/SlotTemplateResponse.dto'
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
      daysOfWeek: slotTemplate.daysOfWeek,
      workTimeStart: slotTemplate.workTimeStart,
      workTimeEnd: slotTemplate.workTimeEnd,
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
  ): Promise<SlotTemplateResponseDto> {
    const newSlotTemplate = await this.slotTemplateRepository.create(
      createSlotTemplateDto,
    )
    return this.mapToResponseDto(newSlotTemplate)
  }

  async updateSlotTemplate(
    id: string,
    updateSlotTemplateDto: Partial<SlotTemplate>,
  ): Promise<SlotTemplateResponseDto> {
    const updatedSlotTemplate =
      await this.slotTemplateRepository.findByIdAndUpdate(
        id,
        updateSlotTemplateDto,
      )
    if (!updatedSlotTemplate) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ với ID "${id}".`,
      )
    }
    return this.mapToResponseDto(updatedSlotTemplate)
  }

  async deleteSlotTemplate(id: string): Promise<void> {
    const deletedSlotTemplate = await this.slotTemplateRepository.delete(id)
    if (!deletedSlotTemplate) {
      throw new NotFoundException(
        `Không tìm thấy mẫu khung giờ với ID "${id}".`,
      )
    }
  }
}
