import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

// Helper to convert "true"/"false" string to boolean
const ToBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value as boolean
  })

export class QueryTestTakerDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn A', description: 'Lọc theo tên' })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    example: '123456789012',
    description: 'Lọc theo số định danh cá nhân',
  })
  @IsOptional()
  @IsString()
  personalId?: string

  @ApiPropertyOptional({
    example: '0123456778',
    description: 'Lọc theo số điện thoạithoại cá nhân',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string

  @ApiPropertyOptional({
    example: true,
    description: 'Lọc theo giới tính (true: Nam, false: Nữ)',
    type: Boolean,
  })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  gender?: boolean

  @ApiPropertyOptional({
    example: '2005-01-01',
    description: 'Lọc theo ngày sinh',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiPropertyOptional({
    example: 'acc123',
    description: 'Lọc theo Account',
  })
  @IsOptional()
  @IsString()
  accountId?: string
}
