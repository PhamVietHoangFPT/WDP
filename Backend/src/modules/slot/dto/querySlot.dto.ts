import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsDateString, IsMongoId, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer' // npm install class-transformer

// Helper function to transform string to boolean
const ToBoolean = () => {
  return Transform(({ value }) => {
    if (value === 'true') return true
    if (value === 'false') return false
    return value as boolean // return original value if not 'true' or 'false'
  })
}

export class QuerySlotDto {
  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Lọc theo ngày bắt đầu (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Lọc theo ngày kết thúc (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ description: 'Lọc theo ID của SlotTemplate' })
  @IsOptional()
  @IsMongoId()
  slotTemplateId?: string

  @ApiPropertyOptional({
    example: true,
    description:
      'Lọc slot còn trống (isAvailable=true tương đương isBooked=false) hoặc đã đặt (isAvailable=false tương đương isBooked=true)',
    type: Boolean,
  })
  @IsOptional()
  @ToBoolean() // Transform "true"/"false" string from query to boolean
  @IsBoolean()
  isAvailable?: boolean // Client sẽ truyền true (còn trống) hoặc false (đã đặt)
}
