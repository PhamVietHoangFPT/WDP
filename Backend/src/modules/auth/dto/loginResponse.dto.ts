import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class LoginResponseDto {
  @Expose()
  @ApiProperty({ example: 'access_token' })
  accessToken: string

  constructor(partial: Partial<LoginResponseDto>) {
    this.accessToken = partial.accessToken ?? ''
  }
}
