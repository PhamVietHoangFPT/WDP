import { FacilityDocument } from '../schemas/facility.schema'
import { CreateFacilityDto } from '../dto/createFacility.dto'
import { FacilityResponseDto } from '../dto/facilityResponse.dto'

export interface IFacilityService {
  create(createFacilityDto: CreateFacilityDto): Promise<FacilityResponseDto>
  findById(id: string): Promise<FacilityResponseDto | null>
  findAll(): Promise<FacilityResponseDto[]>
  update(
    id: string,
    updateFacilityDto: Partial<FacilityDocument>,
  ): Promise<FacilityResponseDto | null>
  delete(id: string, userId: string): Promise<FacilityResponseDto | null>
}
