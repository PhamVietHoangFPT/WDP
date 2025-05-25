import { ApiProperty } from '@nestjs/swagger'
import { IsDateString, IsString, IsNotEmpty, IsMongoId } from 'class-validator'

export class CreateSlotDto {
  @ApiProperty({
    example: '2025-12-31',
    description: 'Ngày của slot (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  slotDate: string

  @ApiProperty({ example: '09:00', description: 'Thời gian bắt đầu slot' })
  @IsNotEmpty()
  @IsString()
  startTime: string

  @ApiProperty({ example: '10:30', description: 'Thời gian kết thúc slot' })
  @IsNotEmpty()
  @IsString()
  endTime: string

  @ApiProperty({ description: 'ID của SlotTemplate liên quan' })
  @IsNotEmpty()
  @IsMongoId()
  slotTemplate: string
}
