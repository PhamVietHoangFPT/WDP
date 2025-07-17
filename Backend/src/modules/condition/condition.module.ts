import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Condition, ConditionSchema } from './schemas/condition.schema'
import { AuthModule } from '../auth/auth.module'
import { AccountModule } from '../account/account.module'
import { ConditionController } from './condition.controller'
import { IConditionRepository } from './interfaces/icondition.repository'
import { ConditionRepository } from './condition.repository'
import { IConditionService } from './interfaces/icondition.service'
import { ConditionService } from './condition.service'

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
      provide: IConditionRepository,
      useClass: ConditionRepository,
    },
    {
      provide: IConditionService,
      useClass: ConditionService,
    },
  ],
  exports: [IConditionRepository, IConditionService],
})
export class ConditionModule {}
