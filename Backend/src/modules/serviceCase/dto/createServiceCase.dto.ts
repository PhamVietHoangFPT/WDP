import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator'

export class CreateServiceCaseDto {
  @ApiProperty({
    example: 'YOUR_UNIQUE_CASE_MEMBER_ID',
    description: 'ID của thành viên trong hồ sơ nhóm người cần xét nghiệm',
    required: true,
  })
  @IsMongoId({ message: 'ID thành viên không hợp lệ' })
  caseMember: string

  @ApiProperty({
    example: 100000,
    description: 'Phí tổng cho dịch vụ tại nhà',
    required: true,
  })
  @IsNotEmpty({ message: 'Phí tổng không được để trống' })
  @IsNumber({}, { message: 'Phí tổng phải là một con số' })
  @Min(0, { message: 'Phí tổng không được là số âm' })
  totalFee: number

  @ApiProperty({
    example: 100000,
    description: 'Phí dịch vụ phát sinh cho dịch vụ tại nhà',
    required: true,
  })
  @IsNotEmpty({ message: 'Phí dịch vụ phát sinh không được để trống' })
  @IsNumber({}, { message: 'Phí dịch vụ phát sinh phải là một con số' })
  @Min(0, { message: 'Phí dịch vụ phát sinh không được là số âm' })
  shippingFee: number
}
