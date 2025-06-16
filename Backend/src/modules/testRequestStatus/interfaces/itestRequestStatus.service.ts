import { TestRequestStatusDocument } from '../schemas/testRequestStatus.schema'
export interface ITestRequestStatusService {
  getAll(): Promise<TestRequestStatusDocument[]>
  findById(id: string): Promise<TestRequestStatusDocument | null>
  findByTestRequestStatus(
    name: string,
  ): Promise<TestRequestStatusDocument | null>
}

export const ITestRequestStatusService = Symbol('ITestRequestStatusService')
