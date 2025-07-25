import { KitShipment } from './schemas/kitShipment.schema'
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { KitShipmentResponseDto } from './dto/kitShipmentResponse.dto'
import { CreateKitShipmentStatusDto } from '../kitShipmentStatus/dto/createKitShipmentStatus.dto'
import { KitShipmentStatusResponseDto } from '../kitShipmentStatus/dto/KitShipmentStatusResponse.dto'
import { UpdateKitShipmentStatusDto } from '../kitShipmentStatus/dto/updateKitShipmentStatus.dto'
import { CreateKitShipmentDto } from './dto/createKitShipment.dto'
import { IKitShipmentService } from './interfaces/ikitShipment.service'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto'
import { IKitShipmentHistoryRepository } from '../kitShipmentHistory/interfaces/iKitShipmentHistory.repository'
import { IKitShipmentStatusRepository } from '../kitShipmentStatus/interfaces/ikitShipmentStatus.repository'

@Injectable()
export class KitShipmentService implements IKitShipmentService {
  constructor(
    @Inject(IKitShipmentRepository)
    private readonly kitShipmentRepository: IKitShipmentRepository,
    @Inject(IKitShipmentHistoryRepository)
    private readonly kitShipmentHistoryRepository: IKitShipmentHistoryRepository,
    @Inject(IKitShipmentStatusRepository)
    private readonly kitShipmentStatusRepository: IKitShipmentStatusRepository,
  ) {}

  private mapToResponseDto(kitShipment: KitShipment): KitShipmentResponseDto {
    return new KitShipmentResponseDto({
      _id: kitShipment._id,
      currentStatus: kitShipment.currentStatus,
      caseMember: kitShipment.caseMember,
      deliveryStaff: kitShipment.deliveryStaff,
      deleted_at: kitShipment.deleted_at,
    })
  }

  async findKitShipmentById(id: string): Promise<KitShipmentResponseDto> {
    //this variable is used to check if the kitShipment already exists
    const existingKitShipment = await this.kitShipmentRepository.findById(id)
    if (!existingKitShipment) {
      throw new ConflictException('Kit shipment không tồn tại')
    }
    return this.mapToResponseDto(existingKitShipment)
  }

  async updateKitShipment(
    id: string,
    userId: string,
    updateKitShipmentDto: UpdateKitShipmentDto,
  ): Promise<any> {
    const existingKitShipment = await this.findKitShipmentById(id)
    if (!existingKitShipment) {
      throw new NotFoundException(
        `Không tìm thấy kiểu trạng thái vận chuyển với ID ${id}.`,
      )
    }
    if (
      existingKitShipment.currentStatus ===
        updateKitShipmentDto.currentStatus &&
      existingKitShipment.caseMember === updateKitShipmentDto.caseMember &&
      existingKitShipment.deliveryStaff === updateKitShipmentDto.deliveryStaff
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    try {
      const updated = await this.kitShipmentRepository.updateKitShipmentById(
        id,
        userId,
        updateKitShipmentDto,
      )
      if (!updated) {
        throw new ConflictException('Không thể cập nhật kit shipment.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi kit shipment.')
    }
  }

  async updateCurrentStatus(
    id: string,
    currentStatus: string,
  ): Promise<KitShipmentResponseDto | null> {
    const oldKitShipmentStatusId =
      await this.kitShipmentRepository.getCurrentStatusId(id)

    const oldKitShipmentStatusOrder =
      await this.kitShipmentStatusRepository.getKitShipmentStatusOrder(
        oldKitShipmentStatusId,
      )

    const newKitShipmentStatusOrder =
      await this.kitShipmentStatusRepository.getKitShipmentStatusOrder(
        currentStatus,
      )

    if (newKitShipmentStatusOrder <= oldKitShipmentStatusOrder) {
      throw new ConflictException(
        'Trạng thái hiện tại không thể cập nhật xuống trạng thái cũ',
      )
    }
    let updatedKitShipment: KitShipment | null
    const customerId =
      await this.kitShipmentRepository.getAccountIdByKitShipmentId(id)
    if (newKitShipmentStatusOrder - oldKitShipmentStatusOrder > 1) {
      if (newKitShipmentStatusOrder === 4 && oldKitShipmentStatusOrder === 2) {
        updatedKitShipment =
          await this.kitShipmentRepository.updateCurrentStatus(
            id,
            currentStatus,
            customerId,
          )
        if (!updatedKitShipment) {
          throw new Error('Cập nhật trạng thái hiện tại không thành công')
        }
        return this.mapToResponseDto(updatedKitShipment)
      } else {
        throw new ConflictException(
          'Trạng thái hiện tại không thể cập nhật quá 1 bước từ trạng thái cũ',
        )
      }
    }

    updatedKitShipment = await this.kitShipmentRepository.updateCurrentStatus(
      id,
      currentStatus,
      customerId,
    )
    if (!updatedKitShipment) {
      throw new Error('Cập nhật trạng thái hiện tại không thành công')
    }
    return this.mapToResponseDto(updatedKitShipment)
  }

  async deleteKitShipment(id: string, userId: string): Promise<any> {
    const existingService = await this.findKitShipmentById(id)

    if (existingService.deleted_at !== null) {
      throw new ConflictException('Kit shipment đã bị xóa trước đó.')
    }
    try {
      const updated = await this.kitShipmentRepository.deleteKitShipmentById(
        id,
        userId,
      )
      if (!updated) {
        throw new ConflictException('Không thể xóa kit shipment.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa kit shipment.')
    }
  }

  async findAllKitShipment(
    pageNumber: number,
    pageSize: number,
    currentStatus: string | null,
    userId: string,
  ): Promise<PaginatedResponse<KitShipmentResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    let filter = {}
    if (currentStatus !== 'null') {
      filter = { currentStatus: currentStatus, created_by: userId }
    } else {
      filter = { created_by: userId }
    }
    const [kitShipments, totalItems] = await Promise.all([
      this.kitShipmentRepository
        .findAllKitShipments(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.kitShipmentRepository.countDocuments(filter), // Use repository for count
    ])
    const totalPages = Math.ceil(totalItems / pageSize)
    const data = kitShipments.map((serviceCase) =>
      this.mapToResponseDto(serviceCase),
    )
    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async createKitShipment(
    userId: string,
    createKitShipmentDto: CreateKitShipmentDto,
  ): Promise<CreateKitShipmentDto> {
    const newService = await this.kitShipmentRepository.create(userId, {
      ...createKitShipmentDto,
    })
    const kitShipmentStatus =
      await this.kitShipmentStatusRepository.findByName('Chờ thanh toán')

    if (!kitShipmentStatus) {
      throw new NotFoundException('Trạng thái vận chuyển không tồn tại.')
    }

    const newKitShipmentHistory =
      await this.kitShipmentHistoryRepository.createKitShipmentHistory(
        kitShipmentStatus._id.toString(),
        newService._id.toString(),
        userId,
      )
    if (!newKitShipmentHistory) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo lịch sử vận chuyển kit.',
      )
    }
    return this.mapToResponseDto(newService)
  }
}
