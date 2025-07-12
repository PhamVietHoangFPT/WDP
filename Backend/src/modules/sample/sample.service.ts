/* eslint-disable @typescript-eslint/no-unused-vars */
import { UpdateSampleDto } from './dto/update-sample.dto'
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
import { ISampleTypeRepository } from '../sampleType/interfaces/isampleType.repository'
@Injectable()
export class SampleService implements ISampleService {
  constructor(
    @Inject(ISampleRepository)
    private readonly sampleRepository: ISampleRepository,
    @Inject(ISampleTypeRepository)
    private readonly sampleTypeRepository: ISampleTypeRepository,
  ) {}

  private mapToResponseDto(sample: Sample): SampleResponseDto {
    return new SampleResponseDto({
      _id: sample._id,
      name: sample.name,
      fee: sample.fee,
      sampleType: sample.sampleType,
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
            sampleType: createSampleDto.sampleType,
            fee: createSampleDto.fee,
          },
        )
        return this.mapToResponseDto(restoreSample)
      }
    }

    const existingSampleType = await this.sampleTypeRepository.findById(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      createSampleDto.sampleType.toString(),
    )
    if (!existingSampleType) {
      throw new ConflictException('Loại mẫu thử không tồn tại.')
    }

    try {
      const newSample = await this.sampleRepository.create(userId, {
        name: createSampleDto.name,
        sampleType: createSampleDto.sampleType,
        fee: createSampleDto.fee,
      })
      return this.mapToResponseDto(newSample)
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo mẫu thử.')
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
      existingSample.sampleType === updateSampleDto.sampleType &&
      existingSample.fee === updateSampleDto.fee
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

    if (existingSample.deleted_at !== null) {
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

  async findById(id: string): Promise<SampleResponseDto> {
    const sample = await this.sampleRepository.findOneById(id)
    if (!sample) {
      throw new ConflictException('Mẫu thử không tồn tại.')
    }
    return this.mapToResponseDto(sample)
  }
}
