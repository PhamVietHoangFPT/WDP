import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { CreateTimeReturnDto } from './createTimeReturn.dto'

export class UpdateTimeReturnDto {
  @ApiProperty({ example: '2', required: true })
  @IsNumber()
  @IsNotEmpty({ message: 'Số ngày trả mẫu không được để trống' })
  timeReturn: number

  @ApiProperty({ example: 100000 })
  @IsNumber({}, { message: 'Phí trả mẫu thử phải là một số' })
  timeReturnFee: number

  @ApiProperty({ example: 'Normal', required: true })
  @IsString()
  description?: string

  constructor(partial: Partial<CreateTimeReturnDto>) {
    Object.assign(this, partial)
  }
}
