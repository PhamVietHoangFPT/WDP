import { IsMongoId, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateImageKitShipmentDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId()
    kitShipment?: string
}
