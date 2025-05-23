import { Account, AccountDocument } from '../account/schemas/account.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { IAuthRepository } from './interfaces/iauth.repository'
import {
  LeanPopulatedAccount,
  PopulatedRoleDetails,
} from '../account/interfaces/iaccount.response'
@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<Account | null> {
    const newAccount = new this.accountModel({
      email: email.toLowerCase(),
      password,
      name: firstName + ' ' + lastName,
    })
    return await newAccount.save()
  }

  loginByEmail(
    email: string,
  ): mongoose.Query<LeanPopulatedAccount | null, AccountDocument> {
    return this.accountModel
      .findOne({ email: email.toLowerCase() })
      .lean<LeanPopulatedAccount>()
      .select('+password')
      .populate<{
        roleId: PopulatedRoleDetails
      }>({ path: 'role', select: 'role -_id' })
      .populate({ path: 'facility', select: 'facilityName' })
  }
}
