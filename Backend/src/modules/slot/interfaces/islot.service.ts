import { Slot, SlotDocument } from '../schemas/slot.schema'
import { CreateSlotDto } from '../dto/createSlot.dto'
import { QuerySlotDto } from '../dto/querySlot.dto'
import { SlotTemplateDocument } from 'src/modules/slotTemplate/schemas/slotTemplate.schema'
import { SlotResponseDto } from '../dto/slotResponse.dto'

export interface ISlotService {
  create(createSlotDto: CreateSlotDto): Promise<SlotDocument>
  findOne(id: string): Promise<SlotResponseDto | null>
  findAll(query: QuerySlotDto): Promise<SlotResponseDto[]>
  update(id: string, updateSlotDto: Partial<Slot>): Promise<SlotDocument | null>
  remove(id: string, userId: string): Promise<SlotDocument | null>
  generateTimeSlotsForTemplateDay(
    template: Pick<
      SlotTemplateDocument,
      'workTimeStart' | 'workTimeEnd' | 'slotDuration' | '_id'
    >, // Chỉ lấy các trường cần thiết từ template
    targetDate: Date,
  ): Omit<Slot, '_id' | 'isBooked' | 'createdAt' | 'updatedAt' | 'id'>[]
  // Các phương thức này sẽ được gọi bởi BookingService
  markSlotAsBooked(slotId: string): Promise<SlotDocument | null>
  markSlotAsAvailable(slotId: string): Promise<SlotDocument | null>
}

export const ISlotService = Symbol('ISlotService')
