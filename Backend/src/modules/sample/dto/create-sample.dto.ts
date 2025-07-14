import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateSampleDto {
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
