import { ApiProperty } from '@nestjs/swagger'
import { Address } from '../schemas/address.schema'

export class AddressResponseDto {
  @ApiProperty()
  _id: string

  @ApiProperty()
  fullName: string

  @ApiProperty()
  fullAddress: string

  @ApiProperty()
  isKitShippingAddress: boolean

  @ApiProperty()
  account: string

  @ApiProperty()
  testTaker: string

  constructor(partial: Partial<Address>) {
    this._id = partial._id ? String() : undefined
    this.fullName = partial.fullName
    this.fullAddress = partial.fullAddress
    this.isKitShippingAddress = partial.isKitShippingAddress
    this.account = partial.account ? String() : undefined
    this.testTaker = partial.testTaker ? String() : undefined
  }
}
