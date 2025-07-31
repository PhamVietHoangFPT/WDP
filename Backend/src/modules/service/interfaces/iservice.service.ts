import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { CreateServiceDto } from '../dto/createService.dto'
import { ServiceResponseDto } from '../dto/serviceResponse.dto'
import { UpdateServiceDto } from '../dto/updateService.dto'
import { FilterServiceDto } from '../dto/filter-service.dto'

export interface IServiceService {
  createService(
    userId: string,
    createServiceDto: CreateServiceDto,
  ): Promise<CreateServiceDto>

  findAllService(
    pageNumber: number,
    pageSize: number,
    filters: Partial<FilterServiceDto>,
  ): Promise<PaginatedResponse<ServiceResponseDto>>
  findServiceById(id: string): Promise<ServiceResponseDto>

  updateService(
    id: string,
    userId: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<any>

  deleteService(id: string, userId: string): Promise<any>

  getServiceWithSampleInventory(
    serviceId: string,
    facilityId: string,
  ): Promise<any>
}

export const IServiceService = Symbol('IServiceService')
