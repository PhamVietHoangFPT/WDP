import { ResultDocument } from '../schemas/result.schema'
import { CreateResultDto } from '../dto/createResult.dto'
import { UpdateResultDto } from '../dto/updateResult.dto'

export interface IResultRepository {
  create(createResultDto: CreateResultDto): Promise<ResultDocument>

  findById(id: string): Promise<ResultDocument | null>

  update(
    id: string,
    updateResultDto: UpdateResultDto,
  ): Promise<ResultDocument | null>

  checkIsUpdated(id: string): Promise<boolean | null>
}

export const IResultRepository = Symbol('IResultRepository')
