import {
  AccountDocument,
  Account,
} from 'src/modules/account/schemas/account.schema'
import mongoose from 'mongoose'
import { LeanPopulatedAccount } from 'src/modules/account/interfaces/iaccount.response'
import { RegisterDto } from '../dto/register.dto'
export interface IAuthRepository {
  loginByEmail(
    email: string,
  ): mongoose.Query<LeanPopulatedAccount | null, AccountDocument>
  createAccount(
    registerDto: RegisterDto,
    roleId: string,
  ): Promise<Partial<Account> | null>
}
export const IAuthRepository = Symbol('IAuthRepository')
