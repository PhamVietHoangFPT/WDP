import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { Account } from 'src/modules/account/schemas/account.schema'

@Exclude()
export class RegisterResponseDto {
  @Expose()
  @ApiProperty({ example: 'Trần Văn C' })
  name: string

  @Expose()
  @ApiProperty({ example: 'vanc@example.com' })
  email: string

  constructor(partial: Partial<Account & { _id?: string }>) {
    this.name = partial.name ?? ''
    this.email = partial.email ?? ''
  }
}
