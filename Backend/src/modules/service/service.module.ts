import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose' // Import MongooseModule
import { Service, ServiceSchema } from './schemas/service.schema'
import { TimeReturnModule } from '../timeReturn/timeReturn.module'
import { SampleModule } from '../sample/sample.module'
import { AuthModule } from '../auth/auth.module'
import { AccountModule } from '../account/account.module'
import { ServiceController } from './service.controller'
import { IServiceRepository } from './interfaces/iservice.repository'
import { ServiceRepository } from './service.repository'
import { IServiceService } from './interfaces/iservice.service'
import { ServiceService } from './service.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    AuthModule,
    AccountModule,
    TimeReturnModule,
    SampleModule,
  ],
  controllers: [ServiceController],
  providers: [
    {
      provide: IServiceRepository,
      useClass: ServiceRepository,
    },
    {
      provide: IServiceService,
      useClass: ServiceService,
    },
  ],
  exports: [IServiceRepository, IServiceService],
})
export class ServiceModule {}
