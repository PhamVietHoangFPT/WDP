/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose from 'mongoose'
import { Relationship } from '../schemas/relationship.schema'

@Exclude()
export class RelationshipResponseDto {
  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  _id: mongoose.Schema.Types.ObjectId

  @Expose()
  @ApiProperty({ example: 'Ba - Con' })
  name: string

  @Expose()
  @ApiProperty({ example: 10000 })
  relationshipFee: number

  @Expose()
  @ApiProperty({ example: 'string' })
  description?: string

  @Expose()
  @ApiProperty({ example: 2 })
  relationshipGap: number

  @Expose()
  @ApiProperty({ example: true })
  isAgnate: boolean

  @Expose()
  @ApiProperty({ example: '2021-03-01T12:00:00Z' })
  deleted_at: Date

  @Expose()
  @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1b', type: String })
  @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
  deleted_by: mongoose.Schema.Types.ObjectId

  constructor(partial: Partial<Relationship>) {
    Object.assign(this, partial)
  }
}
