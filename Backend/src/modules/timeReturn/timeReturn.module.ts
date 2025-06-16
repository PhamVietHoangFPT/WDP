import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TimeReturn, TimeReturnSchema } from './schemas/timeReturn.schema'
import { ITimeReturnService } from './interfaces/itimeReturn.service'
import { ITimeReturnRepository } from './interfaces/itimeReturn.repository'
import { TimeReturnService } from './timeReturn.service'
import { TimeReturnRepository } from './timeReturn.repository'
import { TimeReturnController } from './timeReturn.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TimeReturn.name, schema: TimeReturnSchema },
    ]),
    AuthModule,
  ],
  controllers: [TimeReturnController],
  providers: [
    {
      provide: ITimeReturnService,
      useClass: TimeReturnService,
    },
    {
      provide: ITimeReturnRepository,
      useClass: TimeReturnRepository,
    },
  ],
  exports: [MongooseModule, ITimeReturnService, ITimeReturnRepository],
})
export class TimeReturnModule {}
