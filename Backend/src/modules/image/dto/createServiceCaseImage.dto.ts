import { IsMongoId, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateServiceCaseImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  serviceCase?: string
}
