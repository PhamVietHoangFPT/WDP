import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'

import { ITypeService } from './interfaces/itype.service'
import { ITypeRepository } from './interfaces/itype.repository'
import { CreateTypeDto } from './dto/createType.dto'
import { UpdateTypeDto } from './dto/updateType.dto'
import { TypeDocument } from './schemas/type.schema'
import { TypeResponseDto } from './dto/typeResponse.dto'

@Injectable()
export class TypeService implements ITypeService {
  constructor(
    @Inject(ITypeRepository)
    private readonly typeRepository: ITypeRepository, // Inject the repository
  ) {}

  private mapToResponseDto(type: TypeDocument): TypeResponseDto {
    return new TypeResponseDto({
      _id: type._id,
      name: type.name,
      price: type.price,
    })
  }

  async create(data: CreateTypeDto, userId: string): Promise<TypeResponseDto> {
    const existingType = await this.typeRepository.findTypeByName(data.name)
    if (existingType) {
      throw new BadRequestException(
        `Loại xét nghiệm với tên "${data.name}" đã tồn tại.`,
      )
    }
    const createType = await this.typeRepository.create(data, userId)
    return this.mapToResponseDto(createType)
  }

  async findAll(): Promise<TypeResponseDto[]> {
    const types = await this.typeRepository.findAll()
    if (!types || types.length === 0) {
      throw new NotFoundException('Không tìm thấy loại xét nghiệm nào.')
    }
    return types.map((type) => this.mapToResponseDto(type))
  }

  async findById(id: string): Promise<TypeResponseDto | null> {
    const type = await this.typeRepository.findById(id)
    if (!type) {
      throw new NotFoundException(
        `Không tìm thấy loại xét nghiệm với ID ${id} hoặc đã bị xóa.`,
      )
    }
    return this.mapToResponseDto(type)
  }

  async update(
    id: string,
    data: UpdateTypeDto,
    userId: string,
  ): Promise<TypeResponseDto | null> {
    const existingType = await this.typeRepository.findById(id)
    if (!existingType) {
      throw new NotFoundException(
        `Không tìm thấy loại xét nghiệm với ID ${id}.`,
      )
    }
    const updatedType = await this.typeRepository.update(id, data, userId)
    if (!updatedType) {
      throw new NotFoundException(
        `Không thể cập nhật loại xét nghiệm với ID ${id}.`,
      )
    }
    return this.mapToResponseDto(updatedType)
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const existingType = await this.typeRepository.findById(id)
    if (!existingType) {
      throw new NotFoundException(
        `Không tìm thấy loại xét nghiệm với ID ${id}.`,
      )
    }
    return this.typeRepository.delete(id, userId)
  }

  async findTypeByName(name: string): Promise<TypeDocument | null> {
    const type = await this.typeRepository.findTypeByName(name)
    if (!type) {
      throw new NotFoundException(
        `Không tìm thấy loại xét nghiệm với tên ${name}.`,
      )
    }
    return type
  }
}
