import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { ITestTakerRelationshipRepository } from './interfaces/itestTakerRelationship.repository'
import { ITestTakerRelationshipService } from './interfaces/itestTakerRelationship.service'
import { CreateTestTakerRelationshipDto } from './dto/create-testtaker-relationship.dto'
import { TestTakerRelationshipResponseDto } from './dto/testtaker-relationship-response.dto'
import { TestTakerRelationship } from './schemas/testTakerRelationship.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

@Injectable()
export class TestTakerRelationshipService
  implements ITestTakerRelationshipService
{
  constructor(
    @Inject(ITestTakerRelationshipRepository)
    private readonly relationshipRepository: ITestTakerRelationshipRepository,
  ) {}

  private mapToResponseDto(
    relation: TestTakerRelationship,
  ): TestTakerRelationshipResponseDto {
    return new TestTakerRelationshipResponseDto({
      testTakerRelationship: relation.testTakerRelationship,
      generation: relation.generation,
      isAgnate: relation.isAgnate,
    })
  }

  async create(
    dto: CreateTestTakerRelationshipDto,
  ): Promise<TestTakerRelationshipResponseDto> {
    const { testTakerRelationship, generation, isAgnate } = dto

    const newEntity = await this.relationshipRepository.create({
      testTakerRelationship,
      generation,
      isAgnate,
    })

    return this.mapToResponseDto(newEntity)
  }

  async findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<TestTakerRelationshipResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const data = await this.relationshipRepository
      .findWithQuery({})
      .skip(skip)
      .limit(pageSize)
      .exec()
    const total = await this.relationshipRepository.countDocuments({})

    return {
      data: data.map((e) => this.mapToResponseDto(e)),
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async findById(id: string): Promise<TestTakerRelationshipResponseDto> {
    const entity = await this.relationshipRepository.findById(id)
    if (!entity) {
      throw new NotFoundException(`Không tìm thấy quan hệ với ID "${id}".`)
    }
    return this.mapToResponseDto(entity)
  }

  async update(
    id: string,
    updateDto: Partial<CreateTestTakerRelationshipDto>,
    userId: string,
  ): Promise<TestTakerRelationshipResponseDto> {
    const updated = await this.relationshipRepository.findByIdAndUpdate(
      id,
      updateDto,
      userId,
    )

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy quan hệ để cập nhật.`)
    }

    return this.mapToResponseDto(updated)
  }

  async delete(id: string, userId: string): Promise<void> {
    const alreadyDeleted = await this.relationshipRepository.checkDeleted(id)
    if (alreadyDeleted) {
      throw new ConflictException(`Quan hệ ID "${id}" đã bị xóa từ trước.`)
    }

    const result = await this.relationshipRepository.delete(id, userId)
    if (!result) {
      throw new NotFoundException(`Không tìm thấy quan hệ để xóa.`)
    }
  }
}
