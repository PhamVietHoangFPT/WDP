import { Types } from 'mongoose'

export interface PopulatedRoleDetails {
  _id?: Types.ObjectId | string
  role: string
}

export interface AccountBase {
  _id: Types.ObjectId | string
  name: string
  email: string
  phoneNumber: string
  role: Types.ObjectId | string
  facility: Types.ObjectId | string
  gender: boolean
  password: string
  deleted_at?: Date | null
}

export interface LeanPopulatedAccount extends Omit<AccountBase, 'role'> {
  role: PopulatedRoleDetails
}
