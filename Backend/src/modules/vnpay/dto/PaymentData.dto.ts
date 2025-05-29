import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator'

export class PaymentDataDto {
  @ApiProperty({
    example: 100000, // Đây là số tiền người dùng nhập, ví dụ 100,000 VND
    description:
      'Số tiền thanh toán (đơn vị VND). Hệ thống sẽ tự động nhân 100 khi gửi sang VNPAY.',
    required: true,
  })
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Số tiền phải là một số hợp lệ' },
  )
  @Min(10000, { message: 'Số tiền tối thiểu là 10,000 VND' }) // VNPAY có quy định số tiền tối thiểu
  vnp_Amount: number

  @ApiProperty({
    example: 'Thanh toan don hang #DH12345',
    description: 'Thông tin mô tả cho đơn hàng',
    required: true,
  })
  @IsNotEmpty({ message: 'Thông tin đơn hàng không được để trống' })
  @IsString({ message: 'Thông tin đơn hàng phải là một chuỗi' })
  vnp_OrderInfo: string

  @ApiProperty({
    example: 'YOUR_UNIQUE_TXN_REF_1685123456', // Nên là duy nhất cho mỗi giao dịch
    description: 'Mã tham chiếu của giao dịch trên hệ thống của bạn',
    required: true,
  })
  @IsNotEmpty({ message: 'Mã tham chiếu giao dịch không được để trống' })
  @IsString({ message: 'Mã tham chiếu giao dịch phải là một chuỗi' })
  vnp_TxnRef: string
}
