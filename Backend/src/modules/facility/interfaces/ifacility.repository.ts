import { Facility, FacilityDocument } from '../schemas/facility.schema'
import { CreateFacilityDto } from '../dto/createFacility.dto'

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
  ): Promise<FacilityDocument | null>
  delete(id: string, userId: string): Promise<FacilityDocument | null>
}
export const IFacilityRepository = Symbol('IFacilityRepository')
