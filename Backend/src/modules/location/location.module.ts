import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LocationService } from './location.service'
import { LocationController } from './location.controller'
// Import schema mới
import { Locations, LocationsSchema } from './schemas/location.schema'
import { ILocationService } from './interfaces/ilocation.service'

@Module({
  imports: [
    // Chỉ cần đăng ký một schema duy nhất
    MongooseModule.forFeature([
      { name: Locations.name, schema: LocationsSchema },
    ]),
  ],
  controllers: [LocationController],
  providers: [
    {
      provide: ILocationService,
      useClass: LocationService,
    },
  ],
})
export class LocationModule {}
