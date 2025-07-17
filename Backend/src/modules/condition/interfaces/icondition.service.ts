import { ConditionResponseDto } from '../dto/conditionResponse.dto'

export interface IConditionService {
  findAllCondition(): Promise<ConditionResponseDto[]>
  findConditionById(id: string): Promise<ConditionResponseDto>
}

export const IConditionService = Symbol('IConditionService')
