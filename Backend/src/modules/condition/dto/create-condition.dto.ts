import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateConditionDto {
  @ApiProperty({ example: 'Normal', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: 100000 })
  @IsNumber({}, { message: 'Phí tình trạng mẫu thử phải là một số' })
  conditionFee?: number

  constructor(partial: Partial<CreateConditionDto>) {
    Object.assign(this, partial)
  }
}
