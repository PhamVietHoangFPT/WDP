import { Account, AccountDocument } from '../account/schemas/account.schema'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { IAuthRepository } from './interfaces/iauth.repository'
import {
  LeanPopulatedAccount,
  PopulatedRoleDetails,
} from '../account/interfaces/iaccount.response'
import { RegisterDto } from './dto/register.dto'
@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
  ) {}

  async createAccount(
    registerDto: RegisterDto,
    roleId: string,
  ): Promise<Partial<Account> | null> {
    const { email, name, phoneNumber, gender } = registerDto

    const newAccount = new this.accountModel({
      email: email.toLowerCase(),
      password: registerDto.password,
      name, // Lấy trực tiếp từ DTO
      phoneNumber, // Lấy trực tiếp từ DTO
      gender, // Lấy trực tiếp từ DTO
      role: new mongoose.Types.ObjectId(roleId), // Giả sử role được truyền vào là ObjectId
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
