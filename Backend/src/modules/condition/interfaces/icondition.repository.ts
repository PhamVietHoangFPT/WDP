import { ConditionDocument } from '../schemas/Condition.schema'

export interface IConditionRepository {
    findOneById(id: string): Promise<ConditionDocument | null>
    findAll(): Promise<ConditionDocument[]>
}
export const IConditionRepository = Symbol('IConditionRepository')