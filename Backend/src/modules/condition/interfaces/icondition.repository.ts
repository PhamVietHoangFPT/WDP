import { CreateConditionDto } from '../dto/create-condition.dto'
import { UpdateConditionDto } from '../dto/update-condition.dto'
import { ConditionDocument } from '../schemas/condition.schema'

export interface IConditionRepository {
  create(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<ConditionDocument>
  findOneByName(name: string): Promise<ConditionDocument | null>
  findOneById(id: string): Promise<ConditionDocument | null>
  // findById(id: string): Promise<ConditionDocument | null>;
  findAll(): Promise<ConditionDocument[]>
  updateConditionById(
    id: string,
    userId: string,
    updateConditionDto: Partial<UpdateConditionDto>,
  ): Promise<ConditionDocument | null>
  deleteConditionById(
    id: string,
    userId: string,
  ): Promise<ConditionDocument | null>
}
export const IConditionRepository = Symbol('IConditionRepository')
