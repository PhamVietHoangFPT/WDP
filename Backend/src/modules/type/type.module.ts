import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TypeController } from './type.controller'
import { TypeService } from './type.service'
import { TypeRepository } from './type.repository'
import { Type, TypeSchema } from './schemas/type.schema'
import { ITypeService } from './interfaces/itype.service'
import { ITypeRepository } from './interfaces/itype.repository'
import { RoleModule } from '../role/role.module'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Type.name, schema: TypeSchema }]),
    RoleModule,
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
  exports: [ITypeRepository, ITypeService, MongooseModule],
})
export class TypeModule {}
