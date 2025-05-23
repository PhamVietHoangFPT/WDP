import {
  AccountDocument,
  Account,
} from 'src/modules/account/schemas/account.schema'
import mongoose from 'mongoose'
import { LeanPopulatedAccount } from 'src/modules/account/interfaces/iaccount.response'
export interface IAuthRepository {
  loginByEmail(
    email: string,
  ): mongoose.Query<LeanPopulatedAccount | null, AccountDocument>
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<Account | null>
}
export const IAuthRepository = Symbol('IAuthRepository')
