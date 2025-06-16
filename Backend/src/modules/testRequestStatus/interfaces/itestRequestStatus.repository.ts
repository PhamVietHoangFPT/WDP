import { TestRequestStatusDocument } from '../schemas/testRequestStatus.schema'

export interface ITestRequestStatusRepository {
  getAll(): Promise<TestRequestStatusDocument[]>
  findById(id: string): Promise<TestRequestStatusDocument | null>
  findByTestRequestStatus(
    name: string,
  ): Promise<TestRequestStatusDocument | null>
  getTestRequestStatusIdByName(name: string): Promise<string | null>
}

export const ITestRequestStatusRepository = Symbol(
  'ITestRequestStatusRepository',
)
