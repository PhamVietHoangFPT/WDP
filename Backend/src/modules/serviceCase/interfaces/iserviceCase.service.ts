// import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { CreateServiceCaseDto } from '../dto/createServiceCase.dto'
// import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { ServiceCaseResponseDto } from '../dto/serviceCaseResponse.dto'
export interface IServiceCaseService {
  createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
  ): Promise<ServiceCaseResponseDto>

  // findAllServiceCases(
  //   paginationQuery: PaginationQueryDto,
  // ): Promise<PaginatedResponse<ServiceCaseResponseDto>>
}

export const IServiceCaseService = Symbol('IServiceCaseService')
