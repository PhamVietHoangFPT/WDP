/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsString, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'
import { AdnDocumentation } from '../schemas/adnDocumentation.schema'

const transformObjectId = ({ value }) => value?.toString()
// --- DTO con cho một điểm đánh dấu di truyền (Response) ---
export class GeneticMarkerResponseDto {
  @ApiProperty({ example: 'D8S1179' })
  @Expose()
  @IsString()
  locus: string

  @ApiProperty({ example: ['13', '15.3'] })
  @Expose()
  @IsArray()
  @IsString({ each: true })
  alleles: string[]
}

// --- DTO con cho hồ sơ di truyền của một người (Response) ---
export class IndividualProfileResponseDto {
  @ApiProperty({ example: 'SAMPLE-GUID-CHILD-001' })
  @Expose()
  @IsString()
  sampleIdentifyNumber: string

  @ApiProperty({ type: [GeneticMarkerResponseDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GeneticMarkerResponseDto)
  markers: GeneticMarkerResponseDto[]
}

// --- DTO chính (Response) ---
export class AdnDocumentationResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  _id: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  serviceCase: mongoose.Types.ObjectId

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1z', type: String })
  @Transform(transformObjectId, { toPlainOnly: true })
  doctor: mongoose.Types.ObjectId

  @ApiProperty({ type: [IndividualProfileResponseDto] })
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IndividualProfileResponseDto)
  profiles: IndividualProfileResponseDto[]

  @ApiProperty({ example: '2025-07-30T12:00:00.000Z' })
  @Expose()
  created_at: Date

  constructor(partial: Partial<AdnDocumentation>) {
    Object.assign(this, partial)
  }
}
