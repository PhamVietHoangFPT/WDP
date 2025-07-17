import { IsMongoId, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateImageResultDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    result?: string
}
