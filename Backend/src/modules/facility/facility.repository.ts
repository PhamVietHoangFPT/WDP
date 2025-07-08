import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Facility, FacilityDocument } from './schemas/facility.schema'
import { IFacilityRepository } from './interfaces/ifacility.repository'
import { CreateFacilityDto } from './dto/createFacility.dto'

@Injectable()
export class FacilityRepository implements IFacilityRepository {
  constructor(
    @InjectModel(Facility.name)
    private facilityModel: Model<FacilityDocument>,
  ) {}

  async create(
    createFacilityDto: CreateFacilityDto,
    userId: string,
  ): Promise<FacilityDocument> {
    const newFacility = new this.facilityModel(createFacilityDto)
    newFacility.created_by = new mongoose.Types.ObjectId(userId) as any
    return await newFacility.save()
  }

  async findById(id: string): Promise<FacilityDocument | null> {
    return this.facilityModel
      .findById(id)
      .populate({ path: 'address', select: 'fullAddress _id' })
      .exec()
  }

  async findAll(): Promise<FacilityDocument[]> {
    return this.facilityModel
      .find()
      .populate({ path: 'address', select: 'fullAddress -_id' })
      .exec()
  }

  async update(
    id: string,
    updateFacilityDto: Partial<Facility>,
    userId: string,
  ): Promise<FacilityDocument | null> {
    return this.facilityModel
      .findByIdAndUpdate(
        id,
        {
          ...updateFacilityDto,
          updated_by: new mongoose.Types.ObjectId(userId) as any,
          updated_at: new Date(),
        },
        { new: true },
      )
      .exec()
  }

  async delete(id: string, userId: string): Promise<FacilityDocument | null> {
    return this.facilityModel
      .findByIdAndUpdate(
        id,
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<FacilityDocument[], FacilityDocument> {
    return this.facilityModel
      .find(filter)
      .populate({ path: 'address', select: 'fullAddress -_id' })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.facilityModel.countDocuments(filter).exec()
  }
}
