import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { IAuthService } from './interfaces/iauth.service'
import { IAuthRepository } from './interfaces/iauth.repository'
import { Account, AccountSchema } from '../account/schemas/account.schema'
import { jwtModule } from 'src/config/jwt.config'
import { EmailModule } from '../email/email.module'
import { RoleModule } from '../role/role.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    jwtModule,
    EmailModule,
    RoleModule,
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: IAuthService,
      useClass: AuthService,
    },
    {
      provide: IAuthRepository,
      useClass: AuthRepository,
    },
  ],
  exports: [IAuthService],
})
export class AuthModule {}
