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

  constructor(partial: Partial<CreateConditionDto>) {
    Object.assign(this, partial)
  }
}
