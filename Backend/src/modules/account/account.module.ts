import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose' // Import MongooseModule

import { AccountsService } from './account.service'
import { AccountsController } from './account.controller'
import { AccountsRepository } from './account.repository'
import { Account, AccountSchema } from './schemas/account.schema'
import { IAccountsRepository } from './interfaces/iaccount.repository'
import { IAccountsService } from './interfaces/iaccount.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
  ],
  controllers: [AccountsController],
  providers: [
    {
      provide: IAccountsService,
      useClass: AccountsService,
    },
    {
      provide: IAccountsRepository,
      useClass: AccountsRepository,
    },
  ],
  exports: [IAccountsService],
})
export class AccountModule {}
