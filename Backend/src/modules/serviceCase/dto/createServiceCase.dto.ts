import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class CreateServiceCaseDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_SERVICE_CASE_ID',
    description: 'ID của trường hợp dịch vụ',
    required: true,
  })
  @IsMongoId({ message: 'ID trường hợp dịch vụ không hợp lệ' })
  caseMember: string
}
