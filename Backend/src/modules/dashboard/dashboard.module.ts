import { IDashboardRepository } from './interfaces/idashboard.repository'
import { IDashboardService } from './interfaces/idashboard.service'
import {
  ServiceCase,
  ServiceCaseSchema,
} from '../serviceCase/schemas/serviceCase.schema'
import { Facility, FacilitySchema } from '../facility/schemas/facility.schema'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { DashboardRepository } from './dashboard.repository'
import { DashboardService } from './dashboard.service'
import { DashboardController } from './dashboard.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceCase.name, schema: ServiceCaseSchema },
      { name: Facility.name, schema: FacilitySchema },
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    DashboardRepository,
    {
      provide: IDashboardRepository,
      useClass: DashboardRepository,
    },
    DashboardService,
    {
      provide: IDashboardService,
      useClass: DashboardService,
    },
  ],
  exports: [IDashboardRepository, IDashboardService],
})
export class DashboardModule {}
