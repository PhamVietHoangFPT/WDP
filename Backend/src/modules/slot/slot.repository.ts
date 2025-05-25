/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Slot, SlotDocument } from './schemas/slot.schema'
import { ISlotRepository } from './interfaces/islot.repository'
import { CreateSlotDto } from './dto/createSlot.dto'
import { QuerySlotDto } from './dto/querySlot.dto'

@Injectable()
export class SlotRepository implements ISlotRepository {
  private readonly logger = new Logger(SlotRepository.name)
  constructor(
    @InjectModel(Slot.name)
    private slotModel: Model<SlotDocument>,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<SlotDocument> {
    const newSlot = new this.slotModel(createSlotDto)
    return await newSlot.save()
  }

  async findById(id: string): Promise<SlotDocument | null> {
    return this.slotModel
      .findById(id)
      .populate({ path: 'slotTemplate', select: 'daysOfWeek -_id' })
      .exec()
  }

  async findAll(queryDto: QuerySlotDto): Promise<SlotDocument[]> {
    const mongoQuery: any = {}

    // Xử lý khoảng ngày
    if (queryDto.startDate || queryDto.endDate) {
      mongoQuery.slotDate = {}
      if (queryDto.startDate) {
        mongoQuery.slotDate.$gte = new Date(
          new Date(queryDto.startDate).setUTCHours(0, 0, 0, 0),
        )
      }
      if (queryDto.endDate) {
        mongoQuery.slotDate.$lte = new Date(
          new Date(queryDto.endDate).setUTCHours(23, 59, 59, 999),
        )
      }
    }

    if (queryDto.slotTemplateId) {
      if (mongoose.Types.ObjectId.isValid(queryDto.slotTemplateId)) {
        mongoQuery.slotTemplate = new mongoose.Types.ObjectId(
          queryDto.slotTemplateId,
        )
      } else {
        this.logger.warn(
          `Invalid slotTemplateId format: ${queryDto.slotTemplateId}. Ignoring filter.`,
        )
        // Hoặc có thể trả về mảng rỗng nếu ID không hợp lệ là yêu cầu
        // return [];
      }
    }

    // Xử lý isAvailable (ánh xạ sang isBooked)
    // queryDto.isAvailable là boolean (sau khi transform từ string "true"/"false")
    if (
      queryDto.isAvailable !== undefined &&
      typeof queryDto.isAvailable === 'boolean'
    ) {
      mongoQuery.isBooked = !queryDto.isAvailable // isAvailable: true => isBooked: false
    }

    mongoQuery.deleted_at = null

    return (
      this.slotModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .find(mongoQuery)
        .populate({
          path: 'slotTemplate',
          select: 'facility -_id',
          populate: {
            path: 'facility',
            select: 'facilityName address -_id', // Chỉ lấy tên và địa chỉ của facility
          },
        })
        .sort({ slotDate: 1, startTime: 1 })
        .exec()
    )
  }

  async update(
    id: string,
    updateSlotDto: Partial<Slot>,
  ): Promise<SlotDocument | null> {
    return this.slotModel
      .findByIdAndUpdate(id, updateSlotDto, { new: true })
      .exec()
  }

  async delete(id: string, userId: string): Promise<SlotDocument | null> {
    return this.slotModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
  }

  async setBookingStatus(
    slotId: string,
    isBooked: boolean,
  ): Promise<SlotDocument | null> {
    return this.slotModel
      .findByIdAndUpdate(slotId, { isBooked }, { new: true })
      .exec()
  }
}
