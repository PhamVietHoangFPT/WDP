import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { CreateRelationshipDto } from './createRelationship.dto'
import { Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'

export class UpdateRelationshipDto {
  @ApiProperty({ example: 'Ba - Con', required: true })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name: string

  @ApiProperty({ example: 100000 })
  @IsNumber({}, { message: 'Phí phải là một số' })
  relationshipFee: number

  @ApiProperty({ example: 'string' })
  @IsString()
  description?: string

  @ApiProperty({ example: 2 })
  @IsNumber({}, { message: 'Khoảng cách thế hệ phải là một số' })
  @IsNotEmpty({ message: 'Khoảng cách thế hệ không được để trống' })
  relationshipGap: number

  constructor(partial: Partial<CreateRelationshipDto>) {
    Object.assign(this, partial)
  }
}
