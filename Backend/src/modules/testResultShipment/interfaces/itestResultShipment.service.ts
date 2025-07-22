import { UpdateTestResultShipmentDto } from '../dto/updateTestResultShipment.dto'
import { TestResultShipmentResponseDto } from '../dto/TestResultShipmentResponse.dto'
import { CreateTestResultShipmentDto } from '../dto/createTestResultShipment.dto'

export interface ITestResultShipmentService {
  create(
    data: CreateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentResponseDto>
  findAll(): Promise<TestResultShipmentResponseDto[]>
  findById(id: string): Promise<TestResultShipmentResponseDto | null>
  update(
    id: string,
    data: UpdateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentResponseDto | null>
  delete(id: string, userId: string): Promise<boolean>
}
export const ITestResultShipmentService = Symbol('ITestResultShipmentService')
