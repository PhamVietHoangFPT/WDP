import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsInt, Min, IsDateString, Matches } from 'class-validator'

export class SlotGeneratorDto {
  @ApiPropertyOptional({
    description: 'Số ngày tính từ ngày bắt đầu để tạo slot. Mặc định là 30.',
    example: 7,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  daysToGenerate?: number

  @ApiPropertyOptional({
    description:
      'Ngày bắt đầu tạo slot (YYYY-MM-DD). Mặc định là ngày hiện tại.',
    example: '2025-06-01',
  })
  @IsOptional()
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate phải có định dạng YYYY-MM-DD',
  })
  startDate?: string
}
