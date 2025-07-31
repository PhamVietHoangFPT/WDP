import { ApiProperty } from '@nestjs/swagger'
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

// --- DTO con cho một điểm đánh dấu di truyền ---
export class CreateGeneticMarkerDto {
  @ApiProperty({
    example: 'D8S1179',
    description: 'Tên của locus',
    required: true,
  })
  @IsNotEmpty({ message: 'Tên locus không được để trống' })
  @IsString()
  locus: string

  @ApiProperty({
    example: ['13', '15.3'],
    description: 'Mảng các giá trị Alen',
    required: true,
  })
  @IsArray({ message: 'Alen phải là một mảng' })
  @IsString({ each: true, message: 'Mỗi giá trị alen phải là một chuỗi' })
  alleles: string[]
}

// --- DTO con cho hồ sơ di truyền của một người ---
export class CreateIndividualProfileDto {
  @ApiProperty({
    example: 'SAMPLE-GUID-CHILD-001',
    description: 'GUID của mẫu, liên kết đến người cụ thể',
    required: true,
  })
  @IsNotEmpty({ message: 'Mã định danh mẫu không được để trống' })
  @IsString()
  sampleIdentifyNumber: string

  @ApiProperty({
    type: [CreateGeneticMarkerDto],
    description: 'Danh sách các kết quả phân tích locus',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true }) // Quan trọng: Validate từng object trong mảng
  @Type(() => CreateGeneticMarkerDto) // Quan trọng: Chỉ định kiểu cho class-transformer
  markers: CreateGeneticMarkerDto[]
}

// --- DTO chính ---
export class CreateAdnDocumentationDto {
  @ApiProperty({
    example: '6880cb19362e4434b284b4cb',
    description: 'ID của hồ sơ dịch vụ tổng',
    required: true,
  })
  @IsMongoId({ message: 'ID hồ sơ dịch vụ không hợp lệ' })
  serviceCase: string

  @ApiProperty({
    example: '684a43791bf3c2db7fccb8d3',
    description: 'ID của bác sĩ nhập liệu',
    required: true,
  })
  @IsMongoId({ message: 'ID bác sĩ không hợp lệ' })
  doctor: string

  @ApiProperty({
    type: [CreateIndividualProfileDto],
    description: 'Mảng chứa hồ sơ di truyền của những người tham gia',
    required: true,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIndividualProfileDto)
  profiles: CreateIndividualProfileDto[]
}
