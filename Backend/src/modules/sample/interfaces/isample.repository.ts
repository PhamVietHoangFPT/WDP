import { CreateSampleDto } from '../dto/create-sample.dto'
import { UpdateSampleDto } from '../dto/update-response.dto'
import { SampleDocument } from '../schemas/sample.schema'

export interface ISampleRepository {
  create(
    userId: string,
    createSampleDto: CreateSampleDto,
  ): Promise<SampleDocument>
  findOneByName(name: string): Promise<SampleDocument | null>
  findOneById(id: string): Promise<SampleDocument | null>
  findAll(): Promise<SampleDocument[]>
  updateSampleById(
    id: string,
    userId: string,
    updateSampleDto: Partial<UpdateSampleDto>,
  ): Promise<SampleDocument | null>
  restore(
    id: string,
    userId: string,
    updateSampleDto: Partial<UpdateSampleDto>,
  ): Promise<SampleDocument | null>
  deleteSampleById(id: string, userId: string): Promise<SampleDocument | null>
}
export const ISampleRepository = Symbol('ISampleRepository')
