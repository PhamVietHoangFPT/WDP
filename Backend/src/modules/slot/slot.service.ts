import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'

import { ISlotRepository } from './interfaces/islot.repository'
import { ISlotService } from './interfaces/islot.service'
import { CreateSlotDto } from './dto/createSlot.dto'
import { QuerySlotDto } from './dto/querySlot.dto'
import { SlotTemplateDocument } from '../slotTemplate/schemas/slotTemplate.schema'
import { Slot, SlotDocument } from './schemas/slot.schema'
import { SlotResponseDto } from './dto/slotResponse.dto'

@Injectable()
export class SlotService implements ISlotService {
  private readonly logger = new Logger(SlotService.name)
  constructor(
    @Inject(ISlotRepository)
    private readonly slotRepository: ISlotRepository, // <-- Inject the repository
  ) {}

  private mapToResponseDto(slot: Slot): SlotResponseDto {
    return new SlotResponseDto({
      _id: slot._id,
      slotDate: slot.slotDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: slot.isBooked,
      slotTemplate: slot.slotTemplate,
    })
  }

  async create(createSlotDto: CreateSlotDto) {
    return this.slotRepository.create(createSlotDto)
  }

  async findOne(id: string): Promise<SlotResponseDto> {
    // ... (giữ nguyên)
    const slot = await this.slotRepository.findById(id)
    if (!slot) {
      throw new NotFoundException(`Slot với ID ${id} không tìm thấy.`)
    }
    return this.mapToResponseDto(slot)
  }

  async findAll(query: QuerySlotDto): Promise<SlotResponseDto[]> {
    const slots = await this.slotRepository.findAll(query)
    if (!slots || slots.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy slot nào tuơng ứng với: ${JSON.stringify(query)}`,
      )
    }
    return slots.map((slot) => this.mapToResponseDto(slot))
  }

  async update(
    id: string,
    updateSlotDto: Partial<Slot>,
  ): Promise<SlotDocument | null> {
    // ... (giữ nguyên)
    const updatedSlot = await this.slotRepository.update(id, updateSlotDto)
    if (!updatedSlot) {
      throw new NotFoundException(
        `Slot với ID ${id} không tìm thấy để cập nhật.`,
      )
    }
    return updatedSlot
  }

  async remove(id: string, userId: string): Promise<SlotDocument | null> {
    const slot = await this.findOne(id)
    if (!slot) {
      throw new NotFoundException(`Slot với ID ${id} không tìm thấy để xóa.`)
    }
    if (slot.isBooked) {
      throw new BadRequestException('Không thể xóa slot đã được đặt chỗ.')
    }
    return this.slotRepository.delete(id, userId)
  }

  async markSlotAsBooked(slotId: string): Promise<SlotDocument | null> {
    // ... (giữ nguyên)
    const slot = await this.slotRepository.findById(slotId)
    if (!slot)
      throw new NotFoundException(`Slot với ID ${slotId} không tìm thấy.`)
    if (slot.isBooked)
      throw new BadRequestException(`Slot ${slotId} đã được đặt trước đó.`)
    return this.slotRepository.setBookingStatus(slotId, true)
  }

  async markSlotAsAvailable(slotId: string): Promise<SlotDocument | null> {
    // ... (giữ nguyên)
    const slot = await this.slotRepository.findById(slotId)
    if (!slot)
      throw new NotFoundException(`Slot với ID ${slotId} không tìm thấy.`)
    return this.slotRepository.setBookingStatus(slotId, false)
  }

  public generateTimeSlotsForTemplateDay(
    template: Pick<
      SlotTemplateDocument,
      | 'workTimeStart'
      | 'workTimeEnd'
      | 'slotDuration'
      | '_id'
      | 'facility'
      | 'isSunday'
    >,
    targetDate: Date,
  ): Omit<Slot, '_id' | 'isBooked' | 'createdAt' | 'updatedAt' | 'id'>[] {
    const provisionalSlots: Omit<
      Slot,
      '_id' | 'isBooked' | 'createdAt' | 'updatedAt' | 'id'
    >[] = []
    const {
      workTimeStart,
      workTimeEnd,
      slotDuration,
      _id: slotTemplateId,
      facility,
    } = template

    if (!workTimeStart || !workTimeEnd || !slotDuration || slotDuration <= 0) {
      this.logger.warn(
        `Template có thông tin thời gian hoặc slotDuration không hợp lệ khi tạo provisional slots. Bỏ qua.`,
      )
      return []
    }

    const [startHour, startMinute] = workTimeStart.split(':').map(Number)
    const [endHour, endMinute] = workTimeEnd.split(':').map(Number)

    const workStartTotalMinutes = startHour * 60 + startMinute
    const workEndTotalMinutes = endHour * 60 + endMinute
    const slotDurationMinutes = Math.floor(slotDuration * 60)

    if (slotDurationMinutes === 0) {
      this.logger.warn(
        `Slot duration (minutes) for template is zero for provisional slots. Skipping.`,
      )
      return []
    }

    let currentSlotStartMinutes = workStartTotalMinutes

    while (
      currentSlotStartMinutes + slotDurationMinutes <=
      workEndTotalMinutes
    ) {
      const currentSlotEndMinutes =
        currentSlotStartMinutes + slotDurationMinutes
      const startTimeStr = `${String(Math.floor(currentSlotStartMinutes / 60)).padStart(2, '0')}:${String(currentSlotStartMinutes % 60).padStart(2, '0')}`
      const endTimeStr = `${String(Math.floor(currentSlotEndMinutes / 60)).padStart(2, '0')}:${String(currentSlotEndMinutes % 60).padStart(2, '0')}`

      provisionalSlots.push({
        slotDate: new Date(targetDate),
        startTime: startTimeStr,
        endTime: endTimeStr,
        slotTemplate: slotTemplateId,
        created_by: null,
        updated_by: null,
        created_at: new Date(),
        updated_at: null,
        deleted_at: undefined,
        deleted_by: null,
        facility: facility,
      })

      currentSlotStartMinutes = currentSlotEndMinutes
    }
    return provisionalSlots
  }
}
