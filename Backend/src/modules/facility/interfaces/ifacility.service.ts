import { CreateFacilityDto } from '../dto/createFacility.dto'
import { FacilityResponseDto } from '../dto/facilityResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { UpdateFacilityDto } from '../dto/updateFacility.dto'
import { UpdateAddressFacilityDto } from '../dto/updateAddressFacility.dto'

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
    updateFacilityDto: UpdateFacilityDto,
    userId: string,
  ): Promise<FacilityResponseDto | null>
  delete(id: string, userId: string): Promise<FacilityResponseDto | null>
  getFacilitiesNameAndAddress(): Promise<
    { _id: string; facilityName: string; address: string }[]
  >
  updateAddressFacility(
    id: string,
    updateAddressFacilityDto: UpdateAddressFacilityDto,
  ): Promise<FacilityResponseDto | null>

  getFacilitiesDetails(): Promise<FacilityResponseDto[] | null>
}

export const IFacilityService = Symbol('IFacilityService')
