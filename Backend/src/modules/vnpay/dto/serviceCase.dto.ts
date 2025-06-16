import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId } from 'class-validator'

export class PaymentServiceCaseDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_SERVICE_CASE_ID',
    description: 'ID dịch vụ của người dùng',
    required: true,
  })
  @IsMongoId({ message: 'ID dịch vụ không hợp lệ' })
  serviceCaseId: string
}
