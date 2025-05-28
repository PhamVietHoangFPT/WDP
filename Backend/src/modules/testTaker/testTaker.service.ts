import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { ITestTakerService } from './interfaces/itestTaker.service'
import { ITestTakerRepository } from './interfaces/itestTaker.repository'
import { CreateTestTakerDto } from './dto/create-testtaker.dto'
import { QueryTestTakerDto } from './dto/query-testtaker.dto'
import { TestTakerResponseDto } from './dto/testtaker-response.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { TestTaker } from './schemas/testTaker.schema'

@Injectable()
export class TestTakerService implements ITestTakerService {
  private readonly logger = new Logger(TestTakerService.name)

  constructor(
    @Inject(ITestTakerRepository)
    private readonly testTakerRepository: ITestTakerRepository,
  ) {}

  private mapToResponseDto(testTaker: TestTaker): TestTakerResponseDto {
    return new TestTakerResponseDto({
      ...testTaker,
    })
  }

  async create(dto: CreateTestTakerDto): Promise<TestTakerResponseDto> {
    try {
      const created = await this.testTakerRepository.create(dto)
      return this.mapToResponseDto(created)
    } catch (error) {
      this.logger.error('Error creating TestTaker:', error)
      throw new InternalServerErrorException('Không thể tạo test taker.')
    }
  }

  async findAll(
    query: QueryTestTakerDto,
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>> {
    const skip = (pageNumber - 1) * pageSize

    try {
      const [results, total] = await Promise.all([
        this.testTakerRepository.findAll(query, skip, pageSize),
        this.testTakerRepository.countAll(query),
      ])

      const totalPages = Math.ceil(total / pageSize)

      return new PaginatedResponseDto<TestTakerResponseDto>({
        data: results.map((item) => this.mapToResponseDto(item)),
        pagination: {
          totalItems: total,
          totalPages,
          currentPage: pageNumber,
          pageSize,
        },
        statusCode: 200,
      })
    } catch (error) {
      this.logger.error('Error retrieving TestTakers:', error)
      throw new InternalServerErrorException('Không thể truy vấn danh sách.')
    }
  }

  async findById(id: string): Promise<TestTakerResponseDto> {
    const found = await this.testTakerRepository.findById(id)
    if (!found) {
      throw new NotFoundException(`Không tìm thấy TestTaker với ID ${id}`)
    }
    return this.mapToResponseDto(found)
  }

  async update(
    id: string,
    updateDto: Partial<CreateTestTakerDto>,
  ): Promise<TestTakerResponseDto> {
    const updated = await this.testTakerRepository.update(id, updateDto)
    if (!updated) {
      throw new NotFoundException(`Không tìm thấy TestTaker để cập nhật.`)
    }
    return this.mapToResponseDto(updated)
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.testTakerRepository.delete(id)
    if (!deleted) {
      throw new NotFoundException(`Không tìm thấy TestTaker để xóa.`)
    }
  }
}
