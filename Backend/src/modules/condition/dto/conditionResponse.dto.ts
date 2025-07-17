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
  @ApiProperty({ example: 10000 })
  conditionFee: number

  @Expose()
  @ApiProperty({ example: 'Tốt' })
  condition: string

  @Expose()
  @ApiProperty({
    example: '2023-10-01T00:00:00.000Z',
    type: Date,
    nullable: true,
  })
  deleted_at: Date | null

  constructor(partial: Partial<Condition>) {
    Object.assign(this, partial)
  }
}
