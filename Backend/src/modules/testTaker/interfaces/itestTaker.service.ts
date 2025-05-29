import { CreateTestTakerDto } from '../dto/create-testtaker.dto'
import { TestTakerResponseDto } from '../dto/testtaker-response.dto'
import { QueryTestTakerDto } from '../dto/query-testtaker.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'

export interface ITestTakerService {
  create(dto: CreateTestTakerDto): Promise<TestTakerResponseDto>
  findAll(
    query: QueryTestTakerDto,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>>
  findById(id: string): Promise<TestTakerResponseDto>
  remove(id: string): Promise<void>
}

export const ITestTakerService = Symbol('ITestTakerService')
