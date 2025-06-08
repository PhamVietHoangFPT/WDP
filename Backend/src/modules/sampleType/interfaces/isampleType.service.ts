import { CreateSampleTypeDto } from '../dto/createSampleType.dto'
import { UpdateSampleTypeDto } from '../dto/updateSampleType.dto'
import { SampleTypeResponseDto } from '../dto/sampleTypeResponse.dto'

export interface ISampleTypeService {
  create(
    data: CreateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeResponseDto>
  findAll(): Promise<SampleTypeResponseDto[]>
  findById(id: string): Promise<SampleTypeResponseDto | null>
  update(
    id: string,
    data: UpdateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeResponseDto | null>
  delete(id: string, userId: string): Promise<boolean>
}
export const ISampleTypeService = Symbol('ISampleTypeService')
