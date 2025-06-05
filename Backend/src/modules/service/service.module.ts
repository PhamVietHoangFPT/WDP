import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose' // Import MongooseModule
import { Service, ServiceSchema } from './schemas/service.schema'
import { RelationshipModule } from '../relationship/relationship.module'
import { TimeReturnModule } from '../timeReturn/timeReturn.module'
import { TypeModule } from '../sample/sample.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    RelationshipModule,
    TimeReturnModule,
    TypeModule,
  ],
  //   controllers: [AccountsController],
  //   providers: [
  //     {
  //       provide: IAccountsService,
  //       useClass: AccountsService,
  //     },
  //     {
  //       provide: IAccountsRepository,
  //       useClass: AccountsRepository,
  //     },
  //   ],
  //   exports: [IAccountsService],
})
export class ServiceModule {}
