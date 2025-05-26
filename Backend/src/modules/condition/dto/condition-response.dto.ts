
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Condition } from '../schemas/condition.schema'

@Exclude()
export class ConditionResponseDto {
    @Expose()
    @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    _id: mongoose.Schema.Types.ObjectId

    @Expose()
    @ApiProperty({ example: 'Normal' })
    name: string

    @Expose()
    @ApiProperty({ example: 10000 })
    conditionFee?: number

    constructor(partial: Partial<Condition>) {
        Object.assign(this, partial)
    }
}
