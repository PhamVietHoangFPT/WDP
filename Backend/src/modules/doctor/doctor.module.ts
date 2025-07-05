import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Result, ResultSchema } from '../result/schemas/result.schema'
import { AuthModule } from '../auth/auth.module'
import { DoctorController } from './doctor.controller'
import { ResultModule } from '../result/result.module'
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Result.name, schema: ResultSchema }]),
    AuthModule,
    ResultModule,
  ],
  controllers: [DoctorController],
  // providers: [
  //   {
  //     provide: IResultService,
  //     useClass: ResultService,
  //   },
  //   {
  //     provide: IResultRepository,
  //     useClass: ResultRepository,
  //   },
  // ],
})
export class DoctorModule {}
