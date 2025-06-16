import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { CaseMember, CaseMemberDocument } from './schemas/caseMember.schema'
import { CreateCaseMemberDto } from './dto/createCaseMember.dto'
import { UpdateCaseMemberDto } from './dto/updateCaseMember.dto'
import { ICaseMemberRepository } from './interfaces/icaseMember.repository'

@Injectable()
export class CaseMemberRepository implements ICaseMemberRepository {
  constructor(
    @InjectModel(CaseMember.name)
    private readonly model: Model<CaseMemberDocument>,
  ) {}

  async create(
    dto: CreateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberDocument> {
    const createCaseMember = await this.model.create({
      ...dto,
      created_by: userId,
    })
    return createCaseMember
  }

  async update(
    id: string,
    dto: UpdateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberDocument> {
    return this.model
      .findByIdAndUpdate(
        id,
        { ...dto, updated_by: userId, updated_at: Date.now() },
        { new: true },
      )
      .populate({ path: 'testTaker', select: 'name -_id' })
      .populate({ path: 'booking' })
      .lean()
      .exec()
  }

  async countMemberInCase(id: string): Promise<number> {
    const caseMember = await this.model.findById(id)
    return caseMember ? caseMember.testTaker.length : 0
  }

  async addMember(
    caseMemberId: string,
    testTakerId: string,
    userId: string,
  ): Promise<CaseMemberDocument | null> {
    return this.model.findByIdAndUpdate(
      caseMemberId,
      {
        $addToSet: { testTaker: testTakerId },
        updated_by: userId,
        updated_at: Date.now(),
      },
      { new: true },
    )
  }

  async findById(id: string): Promise<CaseMemberDocument | null> {
    const result = await this.model
      .findById(id)
      .select(
        '-__v -deleted_at -deleted_by -created_by -updated_by -created_at -updated_at',
      )
      .populate({ path: 'testTaker', select: 'name -_id' })
      .populate({
        path: 'booking',
        populate: [
          { path: 'slot', select: 'startTime endTime -_id' },
          { path: 'bookingStatus', select: 'bookingStatus -_id' },
        ],
        select: 'slot bookingStatus',
      })

      .lean()
      .exec()
    return result
  }

  async getBookingIdByCaseMemberId(caseMemberId: string): Promise<string> {
    const caseMember = await this.model.findById(caseMemberId).select('booking')
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return caseMember ? caseMember.booking.toString() : null
  }

  async getSamplingKitInventoryIdByCaseMemberId(
    caseMemberId: string,
  ): Promise<string> {
    const caseMember = await this.model
      .findById(caseMemberId)
      .select('samplingKitInventory')
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return caseMember ? caseMember.samplingKitInventory.toString() : null
  }

  async checkBookingUsed(bookingId: string): Promise<boolean> {
    const caseMember = await this.model.findOne({ booking: bookingId })
    return !!caseMember
  }

  findWithQuery(
    filter: Record<string, any>,
  ): mongoose.Query<CaseMemberDocument[], CaseMemberDocument> {
    return this.model
      .find(filter)
      .populate({ path: 'testTaker', select: 'name gender dateOfBirth -_id' })
      .populate({
        path: 'booking',
        populate: [
          { path: 'slot', select: 'startTime endTime -_id' },
          { path: 'bookingStatus', select: 'bookingStatus -_id' },
        ],
        select: 'slot bookingStatus bookingDate -_id',
      })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.model.countDocuments(filter).exec()
  }

  async getIsAtHome(caseMemberId: string): Promise<boolean | null> {
    const caseMember = await this.model
      .findById(caseMemberId)
      .select('isAtHome')
    return caseMember ? caseMember.isAtHome : null
  }

  async getServiceIdByCaseMemberId(caseMemberId: string): Promise<string> {
    const caseMember = await this.model.findById(caseMemberId).select('service')
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return caseMember ? caseMember.service.toString() : null
  }
}
