import { Injectable } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Condition, ConditionDocument } from "./schemas/Condition.schema"
import { Model } from "mongoose"
import { IConditionRepository } from "./interfaces/icondition.repository"

@Injectable()
export class ConditionRepository implements IConditionRepository {
    constructor(
        @InjectModel(Condition.name)
        private ConditionModel: Model<ConditionDocument>,
    ) { }

    async findAll(): Promise<ConditionDocument[] | null> {
        return await this.ConditionModel
            .find({ deleted_at: null })
            .exec()
    }

    async findOneById(id: string): Promise<ConditionDocument | null> {
        return this.ConditionModel
            .findOne({ _id: id, deleted_at: null })
            .exec()
    }
}
