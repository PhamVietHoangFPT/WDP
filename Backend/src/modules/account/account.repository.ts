import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Account, AccountDocument } from './schemas/account.schema'
import { IAccountsRepository } from './interfaces/iaccount.repository'

@Injectable() // Quan trọng: Đánh dấu là injectable
export class AccountsRepository implements IAccountsRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async create(AccountData: Partial<Account>): Promise<Account> {
    const newAccount = new this.accountModel(AccountData)
    return await newAccount.save()
  }

  async findAll(): Promise<Account[]> {
    return this.accountModel.find().exec()
  }

  async findById(id: string): Promise<Account | null> {
    return this.accountModel.findById(id).exec()
  }

  async findByEmail(email: string): Promise<Account | null> {
    return this.accountModel.findOne({ email: email.toLowerCase() }).exec()
  }

  async findByPhoneNumber(phone_number: string): Promise<Account | null> {
    return this.accountModel
      .findOne({ phoneNumber: phone_number.toLowerCase() })
      .exec()
  }

  async update(
    id: string,
    updateData: Partial<Account>,
  ): Promise<Account | null> {
    return this.accountModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .exec()
  }

  async delete(id: string): Promise<Account | null> {
    return this.accountModel.findByIdAndDelete(id).exec()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.accountModel.countDocuments(filter).exec()
  }

  // CÓ THỂ giữ lại hàm find cơ bản nếu muốn, nhưng PHẢI trả về Query
  find(
    filter: Record<string, unknown>,
  ): mongoose.Query<AccountDocument[], AccountDocument> {
    return this.accountModel.find(filter).lean()
  }

  findWithQuery(
    filter: Record<string, unknown>,
  ): mongoose.Query<AccountDocument[], AccountDocument> {
    return this.accountModel
      .find(filter)
      .lean()
      .populate({ path: 'role', select: 'role -_id' })
  }
}
