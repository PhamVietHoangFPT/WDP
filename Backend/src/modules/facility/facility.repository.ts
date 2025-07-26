import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Facility, FacilityDocument } from './schemas/facility.schema'
import { IFacilityRepository } from './interfaces/ifacility.repository'
import { CreateFacilityDto } from './dto/createFacility.dto'
import { UpdateFacilityDto } from './dto/updateFacility.dto'
import { UpdateAddressFacilityDto } from './dto/updateAddressFacility.dto'

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
      .populate({ path: 'address' })
      .populate({ path: 'address', select: '_id fullAddress location' })
      .exec()
  }

  async findAll(): Promise<FacilityDocument[]> {
    return this.facilityModel
      .find()
      .populate({ path: 'address', select: '_id fullAddress location' })
      .exec()
  }

  async update(
    id: string,
    updateFacilityDto: UpdateFacilityDto,
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
      .populate({ path: 'address' })
      .populate({ path: 'address', select: '_id fullAddress location' })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.facilityModel.countDocuments(filter).exec()
  }

  async getFacilitiesNameAndAddress(): Promise<
    { _id: string; facilityName: string; address: string }[]
  > {
    return this.facilityModel.aggregate([
      { $match: { deleted_at: null } },
      {
        $lookup: {
          from: 'addresses',
          let: { addressId: '$address' },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$addressId'] } } }],
          as: 'address',
        },
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          facilityName: 1,
          address: {
            _id: '$address._id',
            fullAddress: '$address.fullAddress',
            location: '$address.location',
          },
        },
      },
    ])
  }

  async updateAddressFacility(
    id: string,
    updateAddressFacilityDto: UpdateAddressFacilityDto,
  ): Promise<FacilityDocument | null> {
    return this.facilityModel
      .findByIdAndUpdate(
        id,
        { address: updateAddressFacilityDto.address },
        { new: true },
      )
      .exec()
  }

  async getFacilitiesDetails(): Promise<FacilityDocument[] | null> {
    return this.facilityModel
      .find({ deleted_at: null })
      .populate({ path: 'account', select: '_id username email phoneNumber' })
      .populate({
        path: 'address',
        select: '_id fullAddress location phoneNumber',
      })
      .exec()
  }
}
