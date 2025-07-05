import { KitShipment } from './schemas/kitShipment.schema';
import {
    ConflictException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common'
import { IKitShipmentRepository } from './interfaces/ikitShipment.repository'
import { KitShipmentResponseDto } from './dto/kitShipmentResponse.dto';
import { CreateKitShipmentStatusDto } from '../kitShipmentStatus/dto/createKitShipmentStatus.dto';
import { KitShipmentStatusResponseDto } from '../kitShipmentStatus/dto/KitShipmentStatusResponse.dto';
import { UpdateKitShipmentStatusDto } from '../kitShipmentStatus/dto/updateKitShipmentStatus.dto';
import { CreateKitShipmentDto } from './dto/createKitShipment.dto';
import { IKitShipmentService } from './interfaces/ikitShipment.service';
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface';
import { UpdateKitShipmentDto } from './dto/updateKitShipment.dto';

@Injectable()
export class KitShipmentService implements IKitShipmentService {
    constructor(
        @Inject(IKitShipmentRepository)
        private readonly kitShipmentRepository: IKitShipmentRepository,
    ) { }


    private mapToResponseDto(kitShipment: KitShipment): KitShipmentResponseDto {
        return new KitShipmentResponseDto({
            _id: kitShipment._id,
            currentStatus: kitShipment.currentStatus,
            caseMember: kitShipment.caseMember,
            samplingKitInventory: kitShipment.samplingKitInventory,
            address: kitShipment.address,
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

    async updateKitShipment(id: string, userId: string, updateKitShipmentDto: UpdateKitShipmentDto): Promise<any> {
        const existingKitShipment = await this.findKitShipmentById(id)
        if (!existingKitShipment) {
            throw new NotFoundException(
                `Không tìm thấy kiểu trạng thái vận chuyển với ID ${id}.`,
            )
        }

        if (
            existingKitShipment.currentStatus === updateKitShipmentDto.currentStatus &&
            existingKitShipment.caseMember === updateKitShipmentDto.caseMember &&
            existingKitShipment.samplingKitInventory === updateKitShipmentDto.samplingKitInventory &&
            existingKitShipment.address === updateKitShipmentDto.address &&
            existingKitShipment.deliveryStaff === updateKitShipmentDto.deliveryStaff
        ) {
            throw new ConflictException('Không có thay đổi nào để cập nhật.')
        }

        try {
            const updated = await this.kitShipmentRepository.updateKitShipmentById(
                id,
                userId,
                updateKitShipmentDto
            )
            if (!updated) {
                throw new ConflictException('Không thể cập nhật kit shipment.')
            }
            return this.mapToResponseDto(updated)
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi thay đổi kit shipment.')
        }
    }

    async deleteKitShipment(id: string, userId: string): Promise<any> {
        const existingService = await this.findKitShipmentById(id)

        if (existingService.deleted_at !== null) {
            throw new ConflictException('Kit shipment đã bị xóa trước đó.')
        }
        try {
            const updated = await this.kitShipmentRepository.deleteKitShipmentById(id, userId)
            if (!updated) {
                throw new ConflictException('Không thể xóa kit shipment.')
            }
            return this.mapToResponseDto(updated)
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi xóa kit shipment.')
        }
    }

    async findAllKitShipment(pageNumber: number, pageSize: number): Promise<PaginatedResponse<KitShipmentResponseDto>> {
        const skip = (pageNumber - 1) * pageSize
        const filter = {}
        const [kitShipments, totalItems] = await Promise.all([
            this.kitShipmentRepository
                .findWithQuery(filter) // Returns a query object
                .skip(skip)
                .limit(pageSize)
                .exec(), // Execute the query
            this.kitShipmentRepository.countDocuments(filter), // Use repository for count
        ])
        if (!kitShipments || kitShipments.length == 0) {
            throw new ConflictException('Không tìm thấy kit shipment nào.')
        } else {
            try {
                const totalPages = Math.ceil(totalItems / pageSize)
                const data = kitShipments.map((kitShipment: KitShipment) =>
                    this.mapToResponseDto(kitShipment),
                ) // Explicitly type `user`
                return {
                    data,
                    pagination: {
                        totalItems,
                        totalPages,
                        currentPage: pageNumber,
                        pageSize,
                    },
                }
            } catch (error) {
                throw new InternalServerErrorException('Lỗi khi lấy danh sách kit shipment.')
            }
        }
    }

    async createKitShipment(
        userId: string,
        createKitShipmentDto: CreateKitShipmentDto,
    ): Promise<CreateKitShipmentDto> {
        try {
            const newService = await this.kitShipmentRepository.create(userId, {
                ...createKitShipmentDto,
            })
            return this.mapToResponseDto(newService)
        } catch (error) {
            throw new InternalServerErrorException('Lỗi khi tạo dịch vụ.')
        }
    }

}
