import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsMongoId, IsArray, IsBoolean } from 'class-validator'

export class CreateCaseMemberDto {
  @ApiProperty({
    example: ['684a472d7dbf6de7d9f6daba', '684a47eac871f58ee10da5c5'],
    description: 'Mảng các ID của người làm bài (test taker)',
    type: [String], // Chỉ định kiểu dữ liệu là một mảng các chuỗi cho Swagger
  })
  @IsArray({ message: 'testTaker phải là một mảng' }) // 1. Đảm bảo đây là một mảng
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong testTaker phải là một MongoID hợp lệ',
  }) // 2. Xác thực từng phần tử trong mảng
  testTaker: string[]

  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của booking liên kết',
  })
  @IsMongoId({
    message(validationArguments) {
      return `ID booking không hợp lệ: ${validationArguments.value}`
    },
  })
  booking: string

  @ApiProperty({
    example: ['684a472d7dbf6de7d9f6daba', '684a47eac871f58ee10da5c5'],
    description: 'Mảng các ID của người làm bài (test taker)',
    type: [String], // Chỉ định kiểu dữ liệu là một mảng các chuỗi cho Swagger
  })
  @IsMongoId({
    each: true,
    message: 'Mỗi ID trong service phải là một MongoID hợp lệ',
  })
  service: string[]

  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của địa chỉ khách hàng',
  })
  @IsMongoId()
  address: string

  @ApiProperty({
    example: '',
    description: 'Lưu ý',
  })
  @IsString()
  note: string

  @ApiProperty({ example: true, description: 'Trạng thái có mặt tại nhà' })
  @IsBoolean()
  isAtHome: boolean

  @ApiProperty({ example: true, description: 'Trạng thái tự lấy mẫu tại nhà' })
  @IsBoolean()
  isSelfSampling: boolean

  @ApiProperty({
    example: true,
    description: 'Trạng thái mỗi thành viên chỉ sử dụng một dịch vụ',
  })
  @IsBoolean()
  isSingleService: boolean
}
