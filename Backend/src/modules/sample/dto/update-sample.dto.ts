import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { CreateSampleDto } from './create-sample.dto'

export class UpdateSampleDto {
  @ApiProperty({ example: 'Blood', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: 100000, required: true })
  @IsNumber()
  @IsNotEmpty({ message: 'Giá không được để trống' })
  fee: number

  constructor(partial: Partial<CreateSampleDto>) {
    Object.assign(this, partial)
  }
}
