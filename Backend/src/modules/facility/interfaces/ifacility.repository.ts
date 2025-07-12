import { Facility, FacilityDocument } from '../schemas/facility.schema'
import { CreateFacilityDto } from '../dto/createFacility.dto'
import mongoose from 'mongoose'

export interface IFacilityRepository {
  create(
    createFacilityDto: CreateFacilityDto,
    userId: string,
  ): Promise<FacilityDocument>
  findById(id: string): Promise<FacilityDocument | null>
  findAll(): Promise<FacilityDocument[]>
  update(
    id: string,
    updateFacilityDto: Partial<Facility>,
    userId: string,
  ): Promise<FacilityDocument | null>
  delete(id: string, userId: string): Promise<FacilityDocument | null>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<FacilityDocument[], FacilityDocument>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  getFacilitiesNameAndAddress(): Promise<
    { _id: string; facilityName: string; address: string }[]
  >
}
export const IFacilityRepository = Symbol('IFacilityRepository')
