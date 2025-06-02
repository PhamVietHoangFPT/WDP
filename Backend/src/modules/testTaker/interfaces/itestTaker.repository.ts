import { TestTaker } from '../schemas/testTaker.schema'
import { CreateTestTakerDto } from '../dto/createTestTaker.dto'
import { QueryTestTakerDto } from '../dto/queryTestTaker.dto'

export interface ITestTakerRepository {
  create(testTaker: CreateTestTakerDto): Promise<TestTaker>

  findById(id: string): Promise<TestTaker | null>

  findAll(
    query: QueryTestTakerDto,
    skip: number,
    limit: number,
  ): Promise<TestTaker[]>

  countAll(query: QueryTestTakerDto): Promise<number>

  update(
    id: string,
    updateData: Partial<CreateTestTakerDto>,
  ): Promise<TestTaker | null>

  delete(id: string): Promise<boolean>
}

export const ITestTakerRepository = Symbol('ITestTakerRepository')
