import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'Trần Văn C', required: true, minLength: 3 })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(3, { message: 'Tên phải có ít nhất 3 ký tự' })
  name: string

  @ApiProperty({ example: 'vanc@example.com', required: true })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string

  @ApiProperty({ example: 'securepass456', required: true, minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string

  constructor(
    partial: Partial<{ name: string; email: string; password: string }>,
  ) {
    this.name = partial.name ?? ''
    this.email = partial.email ?? ''
    this.password = partial.password ?? ''
  }
}
