import { SampleTypeDocument } from '../schemas/sampleType.schema'
import { CreateSampleTypeDto } from '../dto/createSampleType.dto'
import { UpdateSampleTypeDto } from '../dto/updateSampleType.dto'

export interface ISampleTypeRepository {
  create(data: CreateSampleTypeDto, userId: string): Promise<SampleTypeDocument>
  findAll(): Promise<SampleTypeDocument[]>
  findById(id: string): Promise<SampleTypeDocument | null>
  update(
    id: string,
    data: UpdateSampleTypeDto,
    userId: string,
  ): Promise<SampleTypeDocument | null>
  delete(id: string, userId: string): Promise<boolean>
  findTypeByName(name: string): Promise<SampleTypeDocument | null>
}
export const ISampleTypeRepository = Symbol('ISampleTypeRepository')
