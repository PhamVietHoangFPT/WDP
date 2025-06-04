import { UpdateTypeDto } from './dto/update-response.dto'
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ITypeService } from './interfaces/itype.service'
import { ITypeRepository } from './interfaces/itype.repository'
import { Type } from './schemas/type.schema'
import { TypeResponseDto } from './dto/type-response.dto'
import { CreateTypeDto } from './dto/create-type.dto'
@Injectable()
export class TypeService implements ITypeService {
  constructor(
    @Inject(ITypeRepository)
    private readonly typeRepository: ITypeRepository, // <-- Inject the repository
  ) {}

  private mapToResponseDto(type: Type): TypeResponseDto {
    return new TypeResponseDto({
      _id: type._id,
      name: type.name,
      typeFee: type.typeFee,
      isSpecial: type.isSpecial,
      condition: type.condition,
      description: type.description,
      isAdminstration: type.isAdminstration,
      deleted_at: type.deleted_at,
      deleted_by: type.deleted_by,
    })
  }

  async findTypeById(id: string): Promise<TypeResponseDto> {
    //this variable is used to check if the condition already exists
    const existingType = await this.typeRepository.findOneById(id)
    if (!existingType) {
      throw new ConflictException('Loại mẫu thử không tồn tại')
    }
    return this.mapToResponseDto(existingType)
  }

  //this function create a new condition by checking if the type already exists
  // if it exists, it throws a ConflictException
  // if it does not exist, it creates a new type and returns the created type
  async createType(
    userId: string,
    createTypeDto: CreateTypeDto,
  ): Promise<TypeResponseDto> {
    //this variable is used to check if the condition already exists
    const existingType = await this.typeRepository.findOneByName(
      createTypeDto.name,
    )
    //check if the type is solf deleted
    //if it is, restore it and return the restored type
    if (existingType) {
      if (
        existingType.deleted_at === null ||
        existingType.deleted_by === null
      ) {
        throw new ConflictException('Loại mẫu thử đã tồn tại.')
      } else {
        let restoreCondition = await this.typeRepository.restore(
          existingType.id,
          userId,
          {
            typeFee: createTypeDto.typeFee,
            isSpecial: createTypeDto.isSpecial,
            condition: createTypeDto.condition,
            description: createTypeDto.description,
            isAdminstration: createTypeDto.isAdminstration,
          },
        )
        return this.mapToResponseDto(restoreCondition)
      }
    }
    try {
      let newCondition = await this.typeRepository.create(userId, createTypeDto)
      return this.mapToResponseDto(newCondition)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo tình trạng của mẫu thử.',
      )
    }
  }
  // this function returns all types
  // if there are no conditions, it throws an ConflictException
  async findAllTypes(): Promise<TypeResponseDto[]> {
    try {
      const types = await this.typeRepository.findAll()
      if (!types || types.length === 0) {
        throw new ConflictException('Không tìm thấy loại mẫu thử nào.')
      }
      return types.map((type) => this.mapToResponseDto(type))
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi lấy danh sách loại mẫu thử.',
      )
    }
  }

  async updateType(
    id: string,
    userId: string,
    updateTypeDto: UpdateTypeDto,
  ): Promise<TypeResponseDto> {
    const existingType = await this.findTypeById(id)
    if (
      existingType.name === updateTypeDto.name &&
      existingType.typeFee === updateTypeDto.typeFee &&
      existingType.isSpecial === updateTypeDto.isSpecial &&
      existingType.condition === updateTypeDto.condition &&
      existingType.description === updateTypeDto.description &&
      existingType.isAdminstration === updateTypeDto.isAdminstration
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    const updateName = updateTypeDto.name
    if (updateName == '' || updateName == null) {
      updateTypeDto.name = existingType.name // <-- Use the existing name if not provided
    }
    try {
      const updated = await this.typeRepository.updateTypeById(id, userId, {
        ...updateTypeDto,
      })
      if (!updated) {
        throw new ConflictException('Không thể cập nhật loại mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi loại mẫu thử.')
    }
  }
  async deleteType(id: string, userId: string): Promise<TypeResponseDto> {
    //this variable is used to check if the type already exists
    const existingType = await this.findTypeById(id)

    if (existingType.deleted_at !== null || existingType.deleted_by !== null) {
      throw new ConflictException('Loại mẫu thử đã bị xóa trước đó.')
    }
    try {
      const updated = await this.typeRepository.deleteTypeById(id, userId)
      if (!updated) {
        throw new ConflictException('Không thể xóa loại mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa loại mẫu thử.')
    }
  }
}
