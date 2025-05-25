import { Slot, SlotDocument } from '../schemas/slot.schema'
import { CreateSlotDto } from '../dto/createSlot.dto'
// import { UpdateSlotDto } from '../dto/update-slot.dto'
import { QuerySlotDto } from '../dto/querySlot.dto'

export interface ISlotRepository {
  create(createSlotDto: CreateSlotDto): Promise<SlotDocument>
  findById(id: string): Promise<SlotDocument | null>
  findAll(query: QuerySlotDto): Promise<SlotDocument[]>
  update(id: string, updateSlotDto: Partial<Slot>): Promise<SlotDocument | null>
  delete(id: string, userId: string): Promise<SlotDocument | null>
  // Phương thức để cập nhật trạng thái isBooked
  setBookingStatus(
    slotId: string,
    isBooked: boolean,
  ): Promise<SlotDocument | null>
}

export const ISlotRepository = Symbol('ISlotRepository')
