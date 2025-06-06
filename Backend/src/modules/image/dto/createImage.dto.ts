import { IsMongoId, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBlogImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  blog?: string
}
