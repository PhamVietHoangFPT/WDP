import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty, IsBoolean, IsInt } from 'class-validator'

export class CreateTestTakerRelationshipDto {
  @ApiProperty({
    example: 'Cha',
    description: 'Mối quan hệ với người được xét nghiệm',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mối quan hệ không được để trống' })
  testTakerRelationship: string

  @ApiProperty({
    example: 1,
    description: 'Thế hệ (1: cha/mẹ, 2: ông/bà, 0: con)',
  })
  @IsInt({ message: 'Thế hệ phải là số nguyên' })
  generation: number

  @ApiProperty({ example: true, description: 'Quan hệ theo dòng cha (agnate)' })
  @IsBoolean()
  isAgnate: boolean
}
