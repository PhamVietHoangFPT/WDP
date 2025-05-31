import { Injectable, Logger } from "@nestjs/common";

import { IConditionRepository } from "./interfaces/icondition.repository";
import { Condition, ConditionDocument } from "./schemas/condition.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateConditionDto } from "./dto/create-condition.dto";
import { UpdateConditionDto } from "./dto/update-condition.dto";
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

    async findOneByName(name: string): Promise<ConditionDocument | null> {
        return this.conditionModel.findOne({ name }).exec();
    }

    async findOneById(id: string): Promise<ConditionDocument | null> {
        return this.conditionModel.findById(id).exec();
    }

    async findAll(): Promise<ConditionDocument[] | null> {
        return this.conditionModel
            .find({ deleted_at: null })
            .exec();
    }

    async updateConditionById(id: string, userId: string, updateConditionDto: UpdateConditionDto): Promise<ConditionDocument> {
        return this.conditionModel
            .findByIdAndUpdate(id,
                { ...updateConditionDto, updated_by: userId, updated_at: new Date() },
                { new: true })
            .exec()
    }

    async deleteConditionById(id: string, userId: string): Promise<ConditionDocument> {
        return this.conditionModel
            .findByIdAndUpdate(id,
                { deleted_by: userId, deleted_at: new Date() },
                { new: true })
            .exec()
    }
}