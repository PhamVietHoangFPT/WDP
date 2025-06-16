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
    userId: string,
  ): Promise<PaginatedResponse<ServiceCaseResponseDto>>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
  ): Promise<ServiceCaseResponseDto | null>
}

export const IServiceCaseService = Symbol('IServiceCaseService')
