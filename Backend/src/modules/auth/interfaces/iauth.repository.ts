import {
  AccountDocument,
  Account,
} from 'src/modules/account/schemas/account.schema'
import mongoose from 'mongoose'
export interface IAuthRepository {
  loginByEmail(
    email: string,
  ): mongoose.Query<AccountDocument | null, AccountDocument>
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<Account | null>
}
export const IAuthRepository = Symbol('IAuthRepository')
