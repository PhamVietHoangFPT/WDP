import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  BookingStatus,
  BookingStatusDocument,
} from './schemas/bookingStatus.schema'
import { IBookingStatusRepository } from './interfaces/ibookingStatus.repository'
import { Injectable } from '@nestjs/common'

@Injectable()
export class BookingStatusRepository implements IBookingStatusRepository {
  constructor(
    @InjectModel(BookingStatus.name)
    private readonly bookingStatusModel: Model<BookingStatusDocument>,
  ) {}

  async getAll(): Promise<BookingStatusDocument[]> {
    return this.bookingStatusModel.find().select('_id bookingStatus').exec()
  }

  async findById(id: string): Promise<BookingStatusDocument | null> {
    return this.bookingStatusModel
      .findById(id)
      .select('_id bookingStatus')
      .exec()
  }

  async findByBookingStatus(
    name: string,
  ): Promise<BookingStatusDocument | null> {
    return this.bookingStatusModel
      .findOne({ bookingStatus: name })
      .select('_id')
      .exec()
  }
}
