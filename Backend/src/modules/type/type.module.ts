import { ITypeRepository } from './interfaces/itype.repository'
import { ITypeService } from './interfaces/itype.service'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Type, TypeSchema } from './schemas/type.schema'
import { ConditionModule } from '../condition/condition.module'
import { AuthModule } from '../auth/auth.module'
import { TypeController } from './type.controller'
import { TypeService } from './type.service'
import { TypeRepository } from './type.repository'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    ConditionModule,
    AuthModule,
  ],
  controllers: [TypeController],
  providers: [
    {
      provide: ITypeService,
      useClass: TypeService,
    },
    {
      provide: ITypeRepository,
      useClass: TypeRepository,
    },
  ],
  exports: [MongooseModule],
})
export class TypeModule {}
