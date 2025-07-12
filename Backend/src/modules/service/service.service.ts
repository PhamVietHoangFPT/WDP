import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { IServiceService } from './interfaces/iservice.service'
import { IServiceRepository } from './interfaces/iservice.repository'
import { ServiceResponseDto } from './dto/serviceResponse.dto'
import { Service } from './schemas/service.schema'
import { CreateServiceDto } from './dto/createService.dto'
import { UpdateServiceDto } from './dto/updateService.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { isMongoId } from 'class-validator'
import { FilterServiceDto } from './dto/filter-service.dto'
import { FindAllServiceQueryDto } from './dto/find-all-service-query.dto'

@Injectable()
export class ServiceService implements IServiceService {
  constructor(
    @Inject(IServiceRepository)
    private readonly serviceRepository: IServiceRepository,
  ) { }

  private mapToResponseDto(service: Service): ServiceResponseDto {
    return new ServiceResponseDto({
      _id: service._id,
      fee: service.fee,
      timeReturn: service.timeReturn,
      sample: service.sample,
      isAdministration: service.isAdministration,
      isAgnate: service.isAgnate,
      name: service.name,
      isSelfSampling: service.isSelfSampling,
      deleted_at: service.deleted_at,
      deleted_by: service.deleted_by,
    })
  }

  async findServiceById(id: string): Promise<ServiceResponseDto> {
    if (!id) {
      throw new ConflictException('ID không được để trống')
    }
    if (!isMongoId(id)) {
      throw new ConflictException('ID không hợp lệ')
    }
    const existingService = await this.serviceRepository.findOneById(id)
    if (!existingService) {
      throw new ConflictException('Dịch vụ không tồn tại')
    }
    return this.mapToResponseDto(existingService)
  }

  //this function create a new condition by checking if the Service already exists
  // if it exists, it throws a ConflictException
  // if it does not exist, it creates a new Service and returns the created Service
  async createService(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.serviceRepository.findByName(createServiceDto.name)
    if (existingService) {
      throw new ConflictException('Tên dịch vụ đã tồn tại.')
    }
    try {
      const newService = await this.serviceRepository.create(userId, {
        ...createServiceDto,
      })
      return this.mapToResponseDto(newService)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo dịch vụ.')
    }
  }

  // this function returns all Services
  // if there are no Services, it throws an ConflictException
  async findAllService(
    pageNumber: number,
    pageSize: number,
    filters: Partial<FindAllServiceQueryDto>
  ): Promise<PaginatedResponse<ServiceResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter: Record<string, any> = {};
    if (filters.isAgnate !== undefined) {
      filter.isAgnate = filters.isAgnate;
    }
    if (filters.isAdministration !== undefined) {
      filter.isAdministration = filters.isAdministration;
    }
    if (filters.isSelfSampling !== undefined) {
      filter.isSelfSampling = filters.isSelfSampling;
    }
    console.log('filters', filters);
    console.log('Mongo query', filter);
    const [services, totalItems] = await Promise.all([
      this.serviceRepository
        .findWithQuery(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.serviceRepository.countDocuments(filter), // Use repository for count
    ])
    if (!services || services.length == 0) {
      throw new ConflictException('Không tìm thấy dịch vụ nào.')
    } else {
      try {
        const totalPages = Math.ceil(totalItems / pageSize)
        const data = services.map((service: Service) =>
          this.mapToResponseDto(service),
        ) // Explicitly type `user`
        return {
          data,
          pagination: {
            totalItems,
            totalPages,
            currentPage: pageNumber,
            pageSize,
          },
        }
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lấy danh sách dịch vụ.')
      }
    }
  }

  async updateService(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceResponseDto> {
    const existingService = await this.findServiceById(id)
    if (
      existingService.fee === updateServiceDto.fee &&
      existingService.sample === updateServiceDto.sample &&
      existingService.isAdministration === updateServiceDto.isAdministration &&
      existingService.isAgnate === existingService.isAgnate &&
      existingService.timeReturn === existingService.timeReturn
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }
    try {
      const updated = await this.serviceRepository.updateServiceById(
        id,
        userId,
        {
          ...updateServiceDto,
        },
      )
      if (!updated) {
        throw new ConflictException('Không thể cập nhật dịch vụ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi dịch vụ.')
    }
  }
  async deleteService(id: string, userId: string): Promise<ServiceResponseDto> {
    //this variable is used to check if the Service already exists
    const existingService = await this.findServiceById(id)

    if (existingService.deleted_at !== null) {
      throw new ConflictException('Dịch vụ đã bị xóa trước đó.')
    }
    try {
      const updated = await this.serviceRepository.deleteServiceById(id, userId)
      if (!updated) {
        throw new ConflictException('Không thể xóa dịch vụ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa dịch vụ.')
    }
  }
}
