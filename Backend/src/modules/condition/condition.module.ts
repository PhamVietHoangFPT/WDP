import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Condition, ConditionSchema } from './schemas/condition.schema'
import { ConditionController } from './condition.controller'
import { ConditionService } from './condition.service'
import { IConditionService } from './interfaces/icondition.service'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condition.name, schema: ConditionSchema },
    ]),
    AuthModule
  ],
  controllers: [ConditionController],
  providers: [
    {
      provide: IConditionService,
      useClass: ConditionService,
    },
  ],
  exports: [MongooseModule],
})
export class ConditionModule { }
