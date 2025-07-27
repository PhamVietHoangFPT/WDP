import { CreateTestTakerDto } from '../dto/createTestTaker.dto'
import { TestTakerResponseDto } from '../dto/testTakerResponse.dto'
import { QueryTestTakerDto } from '../dto/queryTestTaker.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'

export interface ITestTakerService {
  create(dto: CreateTestTakerDto, userId: string): Promise<TestTakerResponseDto>
  findAll(
    query: QueryTestTakerDto,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>>
  findAllDeleted(
    query: QueryTestTakerDto,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>>
  findById(id: string): Promise<TestTakerResponseDto>
  remove(id: string): Promise<void>
}

export const ITestTakerService = Symbol('ITestTakerService')
