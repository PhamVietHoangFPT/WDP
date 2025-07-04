import {
    Injectable,
    Inject,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common'
import { IKitShipmentStatusService } from './interfaces/ikitShipmentStatus.service'
import { IKitShipmentStatusRepository } from './interfaces/ikitShipmentStatus.repository'
import { KitShipmentStatusDocument } from './schemas/kitShipmentStatus.schema'
import { KitShipmentStatusResponseDto } from './dto/KitShipmentStatusResponse.dto'
import { CreateKitShipmentStatusDto } from './dto/createKitShipmentStatus.dto'
import { UpdateKitShipmentStatusDto } from './dto/updateKitShipmentStatus.dto'

@Injectable()
export class KitShipmentStatusService implements IKitShipmentStatusService {
    constructor(
        @Inject(IKitShipmentStatusRepository)
        private readonly kitShipmentStatusRepository: IKitShipmentStatusRepository, // Inject the repository
    ) { }

    private mapToResponseDto(kitShipmentStatus: KitShipmentStatusDocument): KitShipmentStatusResponseDto {
        return new KitShipmentStatusResponseDto({
            _id: kitShipmentStatus._id,
            status: kitShipmentStatus.status,
            order: kitShipmentStatus.order,
        })
    }

    async validateShipmentStatusUniqueness(
        status: string,
        order: number,
        repository: any,
    ): Promise<void> {
        const existingName = await repository.findByName(status);
        if (existingName) {
            throw new BadRequestException(
                `Trạng thái vận chuyển với tên "${status}" đã tồn tại.`,
            );
        }
        const existingOrder = await repository.findByOrder(order);
        if (existingOrder) {
            throw new BadRequestException(
                `Thứ tự của trạng thái vận chuyển đã tồn tại.`,
            );
        }
    }

    async create(
        data: CreateKitShipmentStatusDto,
        userId: string,
    ): Promise<KitShipmentStatusResponseDto> {
        await this.validateShipmentStatusUniqueness(
            data.status,
            data.order,
            this.kitShipmentStatusRepository,
        );
        const createStatus = await this.kitShipmentStatusRepository.create(data, userId);
        return this.mapToResponseDto(createStatus);
    }

    async findAll(): Promise<KitShipmentStatusResponseDto[]> {
        const types = await this.kitShipmentStatusRepository.findAll()
        if (!types || types.length === 0) {
            throw new NotFoundException('Không tìm thấy kiểu trạng thái vận chuyển nào.')
        }
        return types.map((type) => this.mapToResponseDto(type))
    }

    async findById(id: string): Promise<KitShipmentStatusResponseDto | null> {
        const type = await this.kitShipmentStatusRepository.findById(id)
        if (!type) {
            throw new NotFoundException(
                `Không tìm thấy kiểu trạng thái vận chuyển với ID ${id} hoặc đã bị xóa.`,
            )
        }
        return this.mapToResponseDto(type)
    }

    async update(
        id: string,
        data: UpdateKitShipmentStatusDto,
        userId: string,
    ): Promise<KitShipmentStatusResponseDto | null> {
        const existingStatus = await this.kitShipmentStatusRepository.findById(id)
        if (!existingStatus) {
            throw new NotFoundException(
                `Không tìm thấy kiểu trạng thái vận chuyển với ID ${id}.`,
            )
        }

        if (
            existingStatus.status === data.status &&
            existingStatus.order === data.order
        ) {
            throw new ConflictException('Không có thay đổi nào để cập nhật.')
        }

        const existingName = await this.kitShipmentStatusRepository.findByName(data.status)
        if (existingName) {
            throw new BadRequestException(
                `Trạng thái vận chuyển với tên "${data.status}" đã tồn tại.`,
            )
        }
        const existingOrder = await this.kitShipmentStatusRepository.findByOrder(data.order)
        if (existingOrder) {
            throw new BadRequestException(
                `Thứ tự của trạng thái vận chuyển đã tồn tại.`,
            )
        }
        const updatedType = await this.kitShipmentStatusRepository.update(id, data, userId)
        if (!updatedType) {
            throw new NotFoundException(
                `Không thể cập nhật kiểu trạng thái vận chuyển với ID ${id}.`,
            )
        }
        return this.mapToResponseDto(updatedType)
    }

    async delete(id: string, userId: string): Promise<boolean> {
        const existingType = await this.kitShipmentStatusRepository.findById(id)
        if (!existingType) {
            throw new NotFoundException(
                `Không tìm thấy kiểu trạng thái vận chuyển với ID ${id}.`,
            )
        }
        return this.kitShipmentStatusRepository.delete(id, userId)
    }
}
