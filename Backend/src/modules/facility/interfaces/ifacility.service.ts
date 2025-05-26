import { FacilityDocument } from '../schemas/facility.schema'
import { CreateFacilityDto } from '../dto/createFacility.dto'
import { FacilityResponseDto } from '../dto/facilityResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

export interface IFacilityService {
  create(
    createFacilityDto: CreateFacilityDto,
    userId: string,
  ): Promise<FacilityResponseDto>
  findById(id: string): Promise<FacilityResponseDto | null>
  findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<FacilityResponseDto>>
  update(
    id: string,
    updateFacilityDto: Partial<FacilityDocument>,
    userId: string,
  ): Promise<FacilityResponseDto | null>
  delete(id: string, userId: string): Promise<FacilityResponseDto | null>
}

export const IFacilityService = Symbol('IFacilityService')
