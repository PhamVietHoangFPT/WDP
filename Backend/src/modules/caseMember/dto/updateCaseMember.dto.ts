import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsMongoId } from 'class-validator'

export class UpdateCaseMemberDto {
  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của dịch vụ liên kết',
  })
  @IsMongoId()
  testTaker: [string]

  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của booking liên kết',
  })
  @IsMongoId()
  booking: string

  @ApiProperty({
    example: '665b4f2a2ef540b5c6d6be3e',
    description: 'ID của dịch vụ liên kết',
  })
  @IsMongoId()
  service: string

  @ApiProperty({
    example: '',
    description: 'Trạng thái của thành viên trong trường hợp',
  })
  @IsString()
  note: string
}
