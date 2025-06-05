// import { TypeResponseDto } from 'src/modules/type/dto/type-response.dto'
import { ConditionResponseDto } from '../dto/condition-response.dto'
import { CreateConditionDto } from '../dto/create-condition.dto'
import { UpdateConditionDto } from '../dto/update-condition.dto'

export interface IConditionService {

  createCondition(
    userId: string,
    createConditionDto: CreateConditionDto,
  ): Promise<CreateConditionDto>

  findAllConditions(): Promise<ConditionResponseDto[]>
  findConditionById(id: string): Promise<ConditionResponseDto>
  updateCondition(
    id: string,
    userId: string,
    updateConditionDto: UpdateConditionDto,
  ): Promise<any>

  deleteCondition(id: string, userId: string): Promise<any>
}

export const IConditionService = Symbol('IConditionService')
