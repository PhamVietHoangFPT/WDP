import { CreateConditionDto } from "../dto/create-condition.dto";
import { Condition, ConditionDocument } from "../schemas/condition.schema";

export interface IConditionRepository {
    create(userId: string, createConditionDto: CreateConditionDto,): Promise<ConditionDocument>;
    // findById(id: string): Promise<ConditionDocument | null>;
    // findAll(): Promise<ConditionDocument[]>;
    // update(id: string, updateConditionDto: Partial<Condition>): Promise<ConditionDocument | null>;
    // delete(id: string, userId: string): Promise<ConditionDocument | null>;
}
export const IConditionRepository = Symbol('IConditionRepository')