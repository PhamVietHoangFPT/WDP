import { CreateTestTakerRelationshipDto } from '../dto/create-testtaker-relationship.dto'
import { TestTakerRelationshipResponseDto } from '../dto/testtaker-relationship-response.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

export interface ITestTakerRelationshipService {
  findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<TestTakerRelationshipResponseDto>>
  findById(id: string): Promise<TestTakerRelationshipResponseDto>

  create(
    dto: CreateTestTakerRelationshipDto,
  ): Promise<TestTakerRelationshipResponseDto>

  update(
    id: string,
    updateDto: Partial<CreateTestTakerRelationshipDto>,
    userId: string,
  ): Promise<TestTakerRelationshipResponseDto>

  delete(id: string, userId: string): Promise<void>
}

export const ITestTakerRelationshipService = Symbol(
  'ITestTakerRelationshipService',
)
