import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateConditionDto {
  @ApiProperty({
    example: 10000,
    description: 'Phí của condition',
  })
  @IsNotEmpty()
  @IsNumber()
  conditionFee: number

  @ApiProperty({
    example: 'Tốt',
    required: true,
    type: String,
  })
  @IsString()
  condition: string

  constructor(partial: Partial<CreateConditionDto>) {
    Object.assign(this, partial)
  }
}
