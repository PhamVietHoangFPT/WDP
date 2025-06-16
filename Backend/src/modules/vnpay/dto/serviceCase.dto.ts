import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsNumber } from 'class-validator'

export class PaymentServiceCaseDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_SERVICE_CASE_ID',
    description: 'ID dịch vụ của người dùng',
    required: true,
  })
  @IsMongoId({ message: 'ID dịch vụ không hợp lệ' })
  serviceCaseId: string

  @ApiProperty({
    example: 100000,
    description: 'Số tiền thanh toán (đơn vị VND)',
    required: true,
  })
  @IsNumber({}, { message: 'Số tiền phải là một con số' })
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  totalFee: number
}
