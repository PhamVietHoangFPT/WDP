import { CreateTestResultShipmentDto } from '../dto/createTestResultShipment.dto'
import { UpdateTestResultShipmentDto } from '../dto/updateTestResultShipment.dto'
import { TestResultShipmentDocument } from '../schemas/testResultShipment.schema'

export interface ITestResultShipmentRepository {
  create(
    data: CreateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentDocument>
  findAll(): Promise<TestResultShipmentDocument[]>
  findById(id: string): Promise<TestResultShipmentDocument | null>
  update(
    id: string,
    data: UpdateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentDocument | null>
  delete(id: string, userId: string): Promise<boolean>
}
export const ITestResultShipmentRepository = Symbol(
  'ITestResultShipmentRepository',
)
