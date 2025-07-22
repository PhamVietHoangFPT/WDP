import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { ITestResultShipmentService } from './interfaces/iTestResultShipment.service'
import { ITestResultShipmentRepository } from './interfaces/iTestResultShipment.repository'
import { TestResultShipmentDocument } from './schemas/TestResultShipment.schema'
import { TestResultShipmentResponseDto } from './dto/TestResultShipmentResponse.dto'
import { CreateTestResultShipmentDto } from './dto/createTestResultShipment.dto'
import { UpdateTestResultShipmentDto } from './dto/updateTestResultShipment.dto'

@Injectable()
export class TestResultShipmentService implements ITestResultShipmentService {
  constructor(
    @Inject(ITestResultShipmentRepository)
    private readonly testResultShipmentRepository: ITestResultShipmentRepository, // Inject the repository
  ) {}

  private mapToResponseDto(
    testResultShipment: TestResultShipmentDocument,
  ): TestResultShipmentResponseDto {
    return new TestResultShipmentResponseDto({
      _id: testResultShipment._id,
      testResultDispatchedDate: testResultShipment.testResultDispatchedDate,
      testResultDeliveryDate: testResultShipment.testResultDeliveryDate,
      deleted_at: testResultShipment.deleted_at,
    })
  }
  async create(
    data: CreateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentResponseDto> {
    const createShipment = await this.testResultShipmentRepository.create(
      data,
      userId,
    )
    return this.mapToResponseDto(createShipment)
  }

  async findAll(): Promise<TestResultShipmentResponseDto[]> {
    const shipments = await this.testResultShipmentRepository.findAll()
    if (!shipments || shipments.length === 0) {
      throw new NotFoundException('Không tìm thấy kiểu vận chuyển nào.')
    }
    return shipments.map((shipment) => this.mapToResponseDto(shipment))
  }

  async findById(id: string): Promise<TestResultShipmentResponseDto | null> {
    const shipment = await this.testResultShipmentRepository.findById(id)
    if (!shipment) {
      throw new NotFoundException(
        `Không tìm thấy vận chuyển với ID ${id} hoặc đã bị xóa.`,
      )
    }
    return this.mapToResponseDto(shipment)
  }

  async update(
    id: string,
    data: UpdateTestResultShipmentDto,
    userId: string,
  ): Promise<TestResultShipmentResponseDto | null> {
    const existingStatus = await this.testResultShipmentRepository.findById(id)
    if (!existingStatus) {
      throw new NotFoundException(`Không tìm thấy vận chuyển với ID ${id}.`)
    }

    if (
      String(existingStatus.testResultDispatchedDate) ===
        String(data.testResultDispatchedDate) &&
      String(existingStatus.testResultDeliveryDate) ===
        String(data.testResultDeliveryDate)
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    const updatedShipment = await this.testResultShipmentRepository.update(
      id,
      data,
      userId,
    )
    if (!updatedShipment) {
      throw new NotFoundException(`Không thể cập nhật vận chuyển với ID ${id}.`)
    }
    return this.mapToResponseDto(updatedShipment)
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existingType = await this.testResultShipmentRepository.findById(id)
    if (!existingType) {
      throw new NotFoundException(`Không tìm thấy vận chuyển với ID ${id}.`)
    }
    return this.testResultShipmentRepository.delete(id, userId)
  }
}
