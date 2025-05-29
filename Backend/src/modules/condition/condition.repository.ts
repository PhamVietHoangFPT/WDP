import { Injectable, Logger } from "@nestjs/common";

import { IConditionRepository } from "./interfaces/icondition.repository";
import { Condition, ConditionDocument } from "./schemas/condition.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateConditionDto } from "./dto/create-condition.dto";
@Injectable()
export class ConditionRepository implements IConditionRepository {
    private readonly logger = new Logger(ConditionRepository.name)
    constructor(
        @InjectModel(Condition.name)
        private conditionModel: Model<ConditionDocument>,
    ) { }

    async create(userId: string, createConditionDto: CreateConditionDto): Promise<ConditionDocument> {
        const newSlot = new this.conditionModel({
            ...createConditionDto,
            created_by: userId,
            created_at: new Date(),
        })
        return await newSlot.save()
    }
}