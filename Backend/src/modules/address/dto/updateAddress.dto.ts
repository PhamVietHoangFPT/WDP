import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsBoolean,
  MinLength,
  IsMongoId,
} from 'class-validator'

export class UpdateAddressDto {
  @IsOptional() // Quan trọng: Đánh dấu thuộc tính này là không bắt buộc
  @IsString({ message: 'Địa chỉ phải là một chuỗi ký tự.' })
  @MinLength(10, { message: 'Địa chỉ phải có ít nhất 10 ký tự.' })
  fullAddress?: string

  @IsOptional()
  @IsBoolean({
    message: 'Trường isKitShippingAddress phải là giá trị true hoặc false.',
  })
  isKitShippingAddress?: boolean

  @IsOptional()
  @ApiProperty({ example: '682dbf1e3ecf256c0683b4d8' })
  @IsMongoId()
  account?: string
}
