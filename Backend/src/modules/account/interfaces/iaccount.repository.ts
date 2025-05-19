import { Account } from '../schemas/account.schema'
import mongoose from 'mongoose'
export interface IAccountsRepository {
  create(accountData: Partial<Account>): Promise<Account>
  findAll(): Promise<Account[]>
  findById(id: string): Promise<Account | null>
  findByEmail(email: string): Promise<Account | null>
  findByPhoneNumber(phone_number: string): Promise<Account | null>
  update(id: string, updateData: Partial<Account>): Promise<Account | null>
  delete(id: string): Promise<Account | null>
  find(filter: Record<string, unknown>): Promise<Account[]>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<Account[], Account>
}

export const IAccountsRepository = Symbol('IAccountsRepository')
