import { ITypeRepository } from './interfaces/itype.repository'
import { InjectModel } from '@nestjs/mongoose'
import { Type, TypeDocument } from './schemas/type.schema'
import { Model } from 'mongoose'
import { CreateTypeDto } from './dto/create-type.dto'
import { Injectable } from '@nestjs/common'
@Injectable()
export class TypeRepository implements ITypeRepository {
    constructor(
        @InjectModel(Type.name)
        private typeModel: Model<TypeDocument>,
    ) { }
    async create(
        userId: string,
        createTypeDto: CreateTypeDto,
    ): Promise<TypeDocument> {
        const newCondition = new this.typeModel({
            ...createTypeDto,
            created_by: userId,
            created_at: new Date(),
        })
        return await newCondition.save()
    }
}
