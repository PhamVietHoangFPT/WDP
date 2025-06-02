import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { TestTakerRelationshipDocument } from '../schemas/testTakerRelationship.schema'

@Exclude()
export class TestTakerRelationshipResponseDto {
  @Expose()
  @ApiProperty({ example: 'rel123' })
  id: string

  @Expose()
  @ApiProperty({ example: 'Mẹ' })
  testTakerRelationship: string

  @Expose()
  @ApiProperty({ example: 1 })
  generation: number

  @Expose()
  @ApiProperty({ example: false })
  isAgnate: boolean

  constructor(partial: Partial<TestTakerRelationshipDocument>) {
    Object.assign(this, partial)
  }
}
