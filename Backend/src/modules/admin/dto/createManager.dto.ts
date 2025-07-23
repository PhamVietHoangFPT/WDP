import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class CreateManagerDto {
  @ApiProperty({ example: 'Trần Văn C', required: true, minLength: 3 })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  name: string

  @ApiProperty({ example: 'vanc@example.com', required: true })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string

  @ApiProperty({ example: '0987654321' })
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string

  @ApiProperty({ example: true })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: boolean
}
