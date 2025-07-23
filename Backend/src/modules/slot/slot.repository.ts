/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, UpdateQuery } from 'mongoose'
import { Slot, SlotDocument } from './schemas/slot.schema'
import { ISlotRepository } from './interfaces/islot.repository'
import { CreateSlotDto } from './dto/createSlot.dto'
import { QuerySlotDto } from './dto/querySlot.dto'
import { ISlotTemplateRepository } from '../slotTemplate/interfaces/islotTemplate.repository'

@Injectable()
export class SlotRepository implements ISlotRepository {
  constructor(
    @InjectModel(Slot.name)
    private slotModel: Model<SlotDocument>,
    @Inject(ISlotTemplateRepository)
    private slotTemplateRepository: ISlotTemplateRepository,
  ) {}

  async create(createSlotDto: CreateSlotDto): Promise<SlotDocument> {
    const newSlot = new this.slotModel(createSlotDto)
    return await newSlot.save()
  }

  async findById(id: string): Promise<SlotDocument | null> {
    return this.slotModel
      .findById(id)
      .populate({ path: 'slotTemplate', select: 'facility -_id' })
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

    // Xử lý isAvailable (ánh xạ sang isBooked)
    // queryDto.isAvailable là boolean (sau khi transform từ string "true"/"false")
    if (
      queryDto.isAvailable !== undefined &&
      typeof queryDto.isAvailable === 'boolean'
    ) {
      mongoQuery.isBooked = !queryDto.isAvailable // isAvailable: true => isBooked: false
    }

    mongoQuery.deleted_at = null

    const slotTemplate = await this.slotTemplateRepository.findByFacilityId(
      queryDto.facilityId,
    )
    if (!slotTemplate || slotTemplate.length === 0) {
      return null
    }
    mongoQuery.slotTemplate = slotTemplate[0]._id

    return (
      this.slotModel
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .find(mongoQuery)
        .select('slotDate startTime endTime')
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
      .findOneAndUpdate(
        { _id: id, deleted_at: null },
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

  async findSlotByFacility(id: string): Promise<boolean> {
    const facility = await this.slotTemplateRepository.findByFacilityId(id)
    if (facility) {
      return true
    }
    return false
  }

  async updateMany(
    filter: FilterQuery<Slot>,
    update: UpdateQuery<Slot>,
  ): Promise<any> {
    // Gọi thẳng hàm updateMany của model
    return this.slotModel.updateMany(filter, update)
  }
}
