import { ApiProperty } from '@nestjs/swagger'
import { Account } from '../../account/schemas/account.schema'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'vanc@example.com', required: true })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string

  @ApiProperty({ example: 'securepass456', required: true, minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string

  constructor(partial: Partial<Account> = {}) {
    this.email = partial.email ?? ''
    this.password = partial.password ?? ''
  }
}
