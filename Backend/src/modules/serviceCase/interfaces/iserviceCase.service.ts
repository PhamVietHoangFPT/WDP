import { CreateServiceCaseDto } from '../dto/createServiceCase.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { ServiceCaseResponseDto } from '../dto/serviceCaseResponse.dto'
export interface IServiceCaseService {
  createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
  ): Promise<ServiceCaseResponseDto>

  findAllServiceCases(
    pageNumber: number,
    pageSize: number,
    currentStatus: string | null,
    userId: string,
  ): Promise<PaginatedResponse<ServiceCaseResponseDto>>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
    deliveryStaffId?: string,
  ): Promise<ServiceCaseResponseDto | null>

  updateCondition(
    id: string,
    condition: string,
    doctorId?: string,
  ): Promise<ServiceCaseResponseDto | null>

  handleCron(): Promise<void>

  cancelServiceCaseIfNoCheckin(): Promise<void>

  findServiceCaseById(id: string): Promise<ServiceCaseResponseDto | null>
}

export const IServiceCaseService = Symbol('IServiceCaseService')
