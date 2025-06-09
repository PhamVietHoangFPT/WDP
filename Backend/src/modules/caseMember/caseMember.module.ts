import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CaseMember, CaseMemberSchema } from './schemas/caseMember.schema'
import { CaseMemberService } from './caseMember.service'
import { CaseMemberRepository } from './caseMember.repository'
import { AuthModule } from '../auth/auth.module'
import { ICaseMemberService } from './interfaces/icaseMember.service'
import { ICaseMemberRepository } from './interfaces/icaseMember.repository'
import { CaseMemberController } from './caseMember.controller'
import { TestTakerModule } from '../testTaker/testTaker.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CaseMember.name, schema: CaseMemberSchema },
    ]),
    AuthModule,
    TestTakerModule,
  ],
  controllers: [CaseMemberController],
  providers: [
    {
      provide: ICaseMemberRepository,
      useClass: CaseMemberRepository,
    },
    {
      provide: ICaseMemberService,
      useClass: CaseMemberService,
    },
  ],
  exports: [ICaseMemberService, ICaseMemberRepository, MongooseModule],
})
export class CaseMemberModule {}
