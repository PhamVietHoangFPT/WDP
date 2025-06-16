import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'

import { ISampleTypeService } from './interfaces/isampleType.service'
import { ISampleTypeRepository } from './interfaces/isampleType.repository'
import { CreateSampleTypeDto } from './dto/createSampleType.dto'
import { UpdateSampleTypeDto } from './dto/updateSampleType.dto'
import { SampleTypeDocument } from './schemas/sampleType.schema'
import { SampleTypeResponseDto } from './dto/sampleTypeResponse.dto'

@Injectable()
export class SampleTypeService implements ISampleTypeService {
  constructor(
    @Inject(ISampleTypeRepository)
    private readonly typeRepository: ISampleTypeRepository, // Inject the repository
  ) {}

  private mapToResponseDto(type: SampleTypeDocument): SampleTypeResponseDto {
    return new SampleTypeResponseDto({
      _id: type._id,
      name: type.name,
      sampleTypeFee: type.sampleTypeFee,
    })
  }

  async create(
    data: CreateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeResponseDto> {
    const existingType = await this.typeRepository.findTypeByName(data.name)
    if (existingType) {
      throw new BadRequestException(
        `Kiểu mẫu xét nghiệm với tên "${data.name}" đã tồn tại.`,
      )
    }
    const createType = await this.typeRepository.create(data, userId)
    return this.mapToResponseDto(createType)
  }

  async findAll(): Promise<SampleTypeResponseDto[]> {
    const types = await this.typeRepository.findAll()
    if (!types || types.length === 0) {
      throw new NotFoundException('Không tìm thấy kiểu mẫu xét nghiệm nào.')
    }
    return types.map((type) => this.mapToResponseDto(type))
  }

  async findById(id: string): Promise<SampleTypeResponseDto | null> {
    const type = await this.typeRepository.findById(id)
    if (!type) {
      throw new NotFoundException(
        `Không tìm thấy kiểu mẫu xét nghiệm với ID ${id} hoặc đã bị xóa.`,
      )
    }
    return this.mapToResponseDto(type)
  }

  async update(
    id: string,
    data: UpdateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeResponseDto | null> {
    const existingType = await this.typeRepository.findById(id)
    if (!existingType) {
      throw new NotFoundException(
        `Không tìm thấy kiểu mẫu xét nghiệm với ID ${id}.`,
      )
    }
    const updatedType = await this.typeRepository.update(id, data, userId)
    if (!updatedType) {
      throw new NotFoundException(
        `Không thể cập nhật kiểu mẫu xét nghiệm với ID ${id}.`,
      )
    }
    return this.mapToResponseDto(updatedType)
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existingType = await this.typeRepository.findById(id)
    if (!existingType) {
      throw new NotFoundException(
        `Không tìm thấy kiểu mẫu xét nghiệm với ID ${id}.`,
      )
    }
    return this.typeRepository.delete(id, userId)
  }

  async findTypeByName(name: string): Promise<SampleTypeDocument | null> {
    const type = await this.typeRepository.findTypeByName(name)
    if (!type) {
      throw new NotFoundException(
        `Không tìm thấy kiểu mẫu xét nghiệm với tên ${name}.`,
      )
    }
    return type
  }
}
