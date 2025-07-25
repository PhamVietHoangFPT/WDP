import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator'

export class CreateServiceCaseDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_SERVICE_CASE_ID',
    description: 'ID của trường hợp dịch vụ',
    required: true,
  })
  @IsMongoId({ message: 'ID trường hợp dịch vụ không hợp lệ' })
  caseMember: string

  @ApiProperty({
    example: 100000,
    description: 'Phí vận chuyển cho dịch vụ tại nhà',
    required: true,
  })
  @IsNotEmpty({ message: 'Phí vận chuyển không được để trống' })
  @IsNumber({}, { message: 'Phí vận chuyển phải là một con số' })
  @Min(0, { message: 'Phí vận chuyển không được là số âm' })
  shippingFee: number
}
