import { CreateSampleDto } from '../dto/create-sample.dto'
import { SampleResponseDto } from '../dto/sample-response.dto'
import { UpdateSampleDto } from '../dto/update-sample.dto'

export interface ISampleService {
  createSample(
    userId: string,
    createSampleDto: CreateSampleDto,
  ): Promise<CreateSampleDto>

  findAllSample(): Promise<SampleResponseDto[]>

  updateSample(
    id: string,
    userId: string,
    updateSampleDto: UpdateSampleDto,
  ): Promise<any>

  deleteSample(id: string, userId: string): Promise<any>

  findById(id: string): Promise<SampleResponseDto>
}

export const ISampleService = Symbol('ISampleService')
