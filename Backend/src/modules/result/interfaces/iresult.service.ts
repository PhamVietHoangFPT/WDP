import { ResultDocument } from '../schemas/result.schema'
import { CreateResultDto } from '../dto/createResult.dto'
import { UpdateResultDto } from '../dto/updateResult.dto'

export interface IResultService {
  create(
    createResultDto: CreateResultDto,
    doctorId: string,
  ): Promise<ResultDocument>

  findById(id: string): Promise<ResultDocument | null>

  update(
    id: string,
    updateResultDto: UpdateResultDto,
  ): Promise<ResultDocument | null>
}
export const IResultService = Symbol('IResultService')
