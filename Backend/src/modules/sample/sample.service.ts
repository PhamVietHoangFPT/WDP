/* eslint-disable @typescript-eslint/no-unused-vars */
import { UpdateSampleDto } from './dto/update-response.dto'
import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { ISampleService } from './interfaces/isample.service'
import { ISampleRepository } from './interfaces/isample.repository'
import { Sample } from './schemas/sample.schema'
import { SampleResponseDto } from './dto/sample-response.dto'
import { CreateSampleDto } from './dto/create-sample.dto'
import { IConditionRepository } from '../condition/interfaces/icondition.repository'
@Injectable()
export class SampleService implements ISampleService {
  constructor(
    @Inject(ISampleRepository)
    private readonly sampleRepository: ISampleRepository,
    @Inject(IConditionRepository)
    private readonly conditionRepository: IConditionRepository, // <-- Inject the repository
  ) {}

  private mapToResponseDto(sample: Sample): SampleResponseDto {
    return new SampleResponseDto({
      _id: sample._id,
      name: sample.name,
      typeFee: sample.typeFee,
      isSpecial: sample.isSpecial,
      condition: sample.condition,
      description: sample.description,
      isAdminstration: sample.isAdminstration,
      deleted_at: sample.deleted_at,
      deleted_by: sample.deleted_by,
    })
  }

  async findSampleById(id: string): Promise<SampleResponseDto> {
    //this variable is used to check if the condition already exists
    const existingSample = await this.sampleRepository.findOneById(id)
    if (!existingSample) {
      throw new ConflictException('Mẫu thử không tồn tại')
    }
    return this.mapToResponseDto(existingSample)
  }

  //this function create a new condition by checking if the sample already exists
  // if it exists, it throws a ConflictException
  // if it does not exist, it creates a new sample and returns the created sample
  async createSample(
    userId: string,
    createSampleDto: CreateSampleDto,
  ): Promise<SampleResponseDto> {
    //this variable is used to check if the condition already exists
    const existingSample = await this.sampleRepository.findOneByName(
      createSampleDto.name,
    )
    //check if the sample is solf deleted
    //if it is, restore it and return the restored sample
    if (existingSample) {
      if (
        existingSample.deleted_at === null ||
        existingSample.deleted_by === null
      ) {
        throw new ConflictException('Mẫu thử đã tồn tại.')
      } else {
        const restoreSample = await this.sampleRepository.restore(
          existingSample.id,
          userId,
          {
            typeFee: createSampleDto.typeFee,
            isSpecial: createSampleDto.isSpecial,
            condition: createSampleDto.condition,
            description: createSampleDto.description,
            isAdminstration: createSampleDto.isAdminstration,
          },
        )
        return this.mapToResponseDto(restoreSample)
      }
    }

    const existingCondition = await this.conditionRepository.findOneById(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      createSampleDto.condition.toString(),
    )
    if (!existingCondition) {
      throw new ConflictException('Tình trạng mẫu thử không tồn tại.')
    }

    try {
      const newCondition = await this.sampleRepository.create(userId, {
        name: createSampleDto.name,
        typeFee: createSampleDto.typeFee,
        isSpecial: createSampleDto.isSpecial,
        condition: existingCondition._id,
        description: createSampleDto.description,
        isAdminstration: createSampleDto.isAdminstration,
      })
      return this.mapToResponseDto(newCondition)
    } catch (error) {
      throw new InternalServerErrorException(
        'Lỗi khi tạo tình trạng của mẫu thử.',
      )
    }
  }

  // this function returns all samples
  // if there are no samples, it throws an ConflictException
  async findAllSample(): Promise<SampleResponseDto[]> {
    const samples = await this.sampleRepository.findAll()
    if (!samples || samples.length == 0) {
      throw new ConflictException('Không tìm thấy mẫu thử nào.')
    } else {
      try {
        return samples.map((sample) => this.mapToResponseDto(sample))
      } catch (error) {
        throw new InternalServerErrorException('Lỗi khi lấy danh sách mẫu thử.')
      }
    }
  }

  async updateSample(
    id: string,
    userId: string,
    updateSampleDto: UpdateSampleDto,
  ): Promise<SampleResponseDto> {
    const existingSample = await this.findSampleById(id)
    if (
      existingSample.name === updateSampleDto.name &&
      existingSample.typeFee === updateSampleDto.typeFee &&
      existingSample.isSpecial === updateSampleDto.isSpecial &&
      existingSample.condition === updateSampleDto.condition &&
      existingSample.description === updateSampleDto.description &&
      existingSample.isAdminstration === updateSampleDto.isAdminstration
    ) {
      throw new ConflictException('Không có thay đổi nào để cập nhật.')
    }

    const updateName = updateSampleDto.name
    if (updateName == '' || updateName == null) {
      updateSampleDto.name = existingSample.name // <-- Use the existing name if not provided
    }
    try {
      const updated = await this.sampleRepository.updateSampleById(id, userId, {
        ...updateSampleDto,
      })
      if (!updated) {
        throw new ConflictException('Không thể cập nhật mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thay đổi mẫu thử.')
    }
  }
  async deleteSample(id: string, userId: string): Promise<SampleResponseDto> {
    //this variable is used to check if the sample already exists
    const existingSample = await this.findSampleById(id)

    if (
      existingSample.deleted_at !== null ||
      existingSample.deleted_by !== null
    ) {
      throw new ConflictException('Mẫu thử đã bị xóa trước đó.')
    }
    try {
      const updated = await this.sampleRepository.deleteSampleById(id, userId)
      if (!updated) {
        throw new ConflictException('Không thể xóa mẫu thử.')
      }
      return this.mapToResponseDto(updated)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa mẫu thử.')
    }
  }
}
