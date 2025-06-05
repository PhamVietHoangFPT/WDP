import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Condition, ConditionSchema } from './schemas/condition.schema'
import { ConditionController } from './condition.controller'
import { ConditionService } from './condition.service'
import { IConditionService } from './interfaces/icondition.service'
import { AuthModule } from '../auth/auth.module'
import { ConditionRepository } from './condition.repository'
import { IConditionRepository } from './interfaces/icondition.repository'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condition.name, schema: ConditionSchema },
    ]),
    AuthModule,
    AccountModule,
  ],
  controllers: [ConditionController],
  providers: [
    {
      provide: IConditionService,
      useClass: ConditionService,
    },
    {
      provide: IConditionRepository,
      useClass: ConditionRepository,
    },
  ],
  exports: [IConditionRepository, IConditionService],
})
export class ConditionModule { }
