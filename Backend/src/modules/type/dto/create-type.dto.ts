import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator'

export class CreateTypeDto {
  @ApiProperty({ example: 'Blood', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: 100000 })
  @IsNumber({}, { message: 'Phí loại mẫu thử phải là một số' })
  typeFee: number

  @ApiProperty({ example: true })
  @IsBoolean({ message: 'isSpecial phải là một giá trị boolean' })
  isSpecial: boolean

  @ApiProperty({ example: '6837d1f5286eb52dfd0579c6', required: true })
  @IsMongoId({ message: 'Condition phải là một chuỗi' })
  condition: string

  @ApiProperty({ example: 'Mẫu máu', required: false })
  @IsString()
  description?: string

  @ApiProperty({ example: true, required: true })
  @IsBoolean({ message: 'isAdminstration phải là một giá trị boolean' })
  isAdminstration: boolean

  constructor(partial: Partial<CreateTypeDto>) {
    Object.assign(this, partial)
  }
}
