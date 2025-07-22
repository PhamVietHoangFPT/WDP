import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  // InternalServerErrorException,
  // BadRequestException,
  // HttpException,
} from '@nestjs/common'

import { IFacilityRepository } from './interfaces/ifacility.repository'
import { IFacilityService } from './interfaces/ifacility.service'
import { CreateFacilityDto } from './dto/createFacility.dto'
import { FacilityResponseDto } from './dto/facilityResponse.dto'
import { Facility } from './schemas/facility.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { UpdateFacilityDto } from './dto/updateFacility.dto'
import { UpdateAddressFacilityDto } from './dto/updateAddressFacility.dto'

@Injectable()
export class FacilityService implements IFacilityService {
  constructor(
    @Inject(IFacilityRepository)
    private readonly facilityRepository: IFacilityRepository, // <-- Thay đổi cách inject
  ) {}

  private mapToResponseDto(facility: Facility): FacilityResponseDto {
    return new FacilityResponseDto({
      _id: facility._id,
      facilityName: facility.facilityName,
      address: facility.address,
      phoneNumber: facility.phoneNumber,
    })
  }

  async findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<FacilityResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}
    // Fetch facilities and total count in parallel
    const [facilities, totalItems] = await Promise.all([
      this.facilityRepository
        .findWithQuery(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.facilityRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = facilities.map((facility: Facility) =>
      this.mapToResponseDto(facility),
    )
    return {
      data,
      pagination: {
        totalItems,
        pageSize,
        totalPages,
        currentPage: pageNumber,
      },
    }
  }

  async findById(id: string): Promise<FacilityResponseDto> {
    const facility = await this.facilityRepository.findById(id) // Sử dụng repo đã inject
    if (!facility) {
      throw new NotFoundException(`Không tìm thấy cơ sở với ID "${id}".`)
    }
    return this.mapToResponseDto(facility)
  }

  async create(
    createFacilityDto: CreateFacilityDto,
    userId: string, // Thêm tham số userId nếu cần thiết
  ): Promise<FacilityResponseDto> {
    const existingFacility = await this.facilityRepository.findWithQuery({
      facilityName: createFacilityDto.facilityName,
    })

    if (existingFacility.length > 0) {
      throw new ConflictException(
        `Cơ sở với tên "${createFacilityDto.facilityName}" đã tồn tại.`,
      )
    }

    const existingFacilityByPhone = await this.facilityRepository.findWithQuery(
      {
        phoneNumber: createFacilityDto.phoneNumber,
      },
    )

    if (existingFacilityByPhone.length > 0) {
      throw new ConflictException(
        `Cơ sở với số điện thoại "${createFacilityDto.phoneNumber}" đã tồn tại.`,
      )
    }

    const newFacility = await this.facilityRepository.create(
      createFacilityDto,
      userId,
    )
    return this.mapToResponseDto(newFacility)
  }

  async update(
    id: string,
    updateFacilityDto: UpdateFacilityDto,
    userId: string,
  ): Promise<FacilityResponseDto> {
    try {
      const updatedFacility = await this.facilityRepository.update(
        id,
        updateFacilityDto,
        userId, // Thêm tham số userId nếu cần thiết
      )
      if (!updatedFacility) {
        throw new NotFoundException(`Không tìm thấy cơ sở với ID "${id}".`)
      }
      return this.mapToResponseDto(updatedFacility)
    } catch (error) {
      throw new ConflictException(
        'Cập nhật cơ sở không thành công do trùng thông tin với cơ sở khác.',
        error.message,
      )
    }
  }

  async delete(
    id: string,
    userId: string, // Thêm tham số userId nếu cần thiết
  ): Promise<FacilityResponseDto> {
    const deletedFacility = await this.facilityRepository.delete(id, userId)
    if (!deletedFacility) {
      throw new NotFoundException(`Không tìm thấy cơ sở với ID "${id}".`)
    }
    return this.mapToResponseDto(deletedFacility)
  }

  async getFacilitiesNameAndAddress(): Promise<
    { _id: string; facilityName: string; address: string }[]
  > {
    const data = await this.facilityRepository.getFacilitiesNameAndAddress()
    if (!data || data.length === 0) {
      throw new NotFoundException('Không tìm thấy cơ sở nào.')
    }
    return data
  }

  async updateAddressFacility(
    id: string,
    updateAddressFacilityDto: UpdateAddressFacilityDto,
  ): Promise<FacilityResponseDto> {
    const updatedFacility = await this.facilityRepository.updateAddressFacility(
      id,
      updateAddressFacilityDto,
    )
    if (!updatedFacility) {
      throw new NotFoundException(`Không tìm thấy cơ sở với ID "${id}".`)
    }
    return this.mapToResponseDto(updatedFacility)
  }
}
