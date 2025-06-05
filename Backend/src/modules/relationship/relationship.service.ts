import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { IRelationshipService } from './interfaces/irelationship.service'
import { IRelationshipRepository } from './interfaces/irelationship1.repository'
import { Relationship } from './schemas/relationship1.schema'
import { RelationshipResponseDto } from './dto/relationshipResponse.dto'
import { CreateRelationshipDto } from './dto/createRelationship.dto'
import { UpdateRelationshipDto } from './dto/updateRelationship.dto'

@Injectable()
export class RelationshipService implements IRelationshipService {
  constructor(
    @Inject(IRelationshipRepository)
    private readonly relationshipRepository: IRelationshipRepository,
  ) {}

  private mapToResponseDto(
    relationship: Relationship,
  ): RelationshipResponseDto {
    return new RelationshipResponseDto({
      _id: relationship._id,
      name: relationship.name,
      relationshipFee: relationship.relationshipFee,
      relationshipGap: relationship.relationshipGap,
      description: relationship.description,
      deleted_at: relationship.deleted_at,
      deleted_by: relationship.deleted_by,
    })
  }

  async findRelationshipById(id: string): Promise<RelationshipResponseDto> {
    //this variable is used to check if the Relationship already exists
    const existingRelationship =
      await this.relationshipRepository.findOneById(id)
    if (!existingRelationship) {
      throw new ConflictException('Mối quan hệ không tồn tại')
    }
    return this.mapToResponseDto(existingRelationship)
  }

  async createRelationship(
    userId: string,
    createRelationshipDto: CreateRelationshipDto,
  ): Promise<CreateRelationshipDto> {
    //this variable is used to check if the Relationship already exists
    const existingRelationship =
      await this.relationshipRepository.findOneByName(
        createRelationshipDto.name,
      )
    //check if the Relationship is solf deleted
    //if it is, restore it and return the restored Relationship
    if (existingRelationship) {
      if (
        existingRelationship.deleted_at === null ||
        existingRelationship.deleted_by === null
      ) {
        throw new ConflictException('Mối quan hệ đã tồn tại.')
      } else {
        let restoreRelationship = await this.relationshipRepository.restore(
          existingRelationship.id,
          userId,
          {
            relationshipFee: createRelationshipDto.relationshipFee,
            relationshipGap: createRelationshipDto.relationshipGap,
            description: createRelationshipDto.description,
          },
        )
        return this.mapToResponseDto(restoreRelationship)
      }
    }
    try {
      let newRelationship = await this.relationshipRepository.create(
        userId,
        createRelationshipDto,
      )
      return this.mapToResponseDto(newRelationship)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo mối quan hệ của mẫu thử.',
      )
    }
  }
  async findAllRelationships(): Promise<RelationshipResponseDto[]> {
    const relationships = await this.relationshipRepository.findAll()
    if (!relationships || relationships.length === 0) {
      throw new ConflictException('Không tìm thấy mối quan hệ nào.')
    } else {
      try {
        return relationships.map((relationship) =>
          this.mapToResponseDto(relationship),
        )
      } catch (error) {
        throw new InternalServerErrorException(
          'Lỗi khi lấy danh sách mối quan hệ.',
        )
      }
    }
  }
  async updateRelationship(
    id: string,
    userId: string,
    updateRelationshipDto: UpdateRelationshipDto,
  ): Promise<any> {
    const existingRelationship = await this.findRelationshipById(id)
    if (
      existingRelationship.name === updateRelationshipDto.name &&
      existingRelationship.relationshipFee ===
        updateRelationshipDto.relationshipFee &&
      existingRelationship.relationshipGap ===
        updateRelationshipDto.relationshipGap &&
      existingRelationship.description === updateRelationshipDto.description
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    const updateName = updateRelationshipDto.name
    if (updateName == '' || updateName == null) {
      updateRelationshipDto.name = existingRelationship.name // <-- Use the existing name if not provided
    }

    try {
      const updated = await this.relationshipRepository.updateRelationshipById(
        id,
        userId,
        { ...updateRelationshipDto },
      )
      if (!updated) {
        throw new ConflictException('Không thể cập nhật mối quan hệ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi mối quan hệ.')
    }
  }
  async deleteRelationship(id: string, userId: string): Promise<any> {
    //this variable is used to check if the Relationship already exists
    const existingRelationship = await this.findRelationshipById(id)

    if (
      existingRelationship.deleted_at !== null ||
      existingRelationship.deleted_by !== null
    ) {
      throw new ConflictException('Mối quan hệ đã bị xóa trước đó.')
    }

    try {
      const updated = await this.relationshipRepository.deleteRelationshipById(
        id,
        userId,
      )
      if (!updated) {
        throw new ConflictException('Không thể xóa mối quan hệ.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa mối quan hệ.')
    }
  }
}
