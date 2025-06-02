import { ApiProperty } from '@nestjs/swagger'
import { CreateConditionDto } from './create-condition.dto'
import {
  isEmpty,
  IsEmpty,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'

export class UpdateConditionDto {
  @ApiProperty({ example: 'Normal' })
  @IsString()
  name: string

  @ApiProperty({ example: 100000 })
  @IsNumber({ allowNaN: true }, { message: 'Condition fee must be a number' })
  conditionFee?: number

  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  @IsEmpty()
  deleted_at?: Date
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })

  @IsEmpty()
  deleted_by?: string

  constructor(partial: Partial<CreateConditionDto>) {
    Object.assign(this, partial)
  }
}
