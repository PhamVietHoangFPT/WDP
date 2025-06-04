import { IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class CreateImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  testRequestHistoryTestRequestStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  testRequestHistoryTestRequest?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kitShipment?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  testRequestShipmentHistoryShipmentStatus?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  testRequestShipmentHistoryTestRequestShipment?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  blog?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  administrationDocument?: string
}
