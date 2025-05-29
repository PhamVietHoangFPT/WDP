import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { LocationService } from './location.service'
import { LocationController } from './location.controller'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  providers: [LocationService],
  controllers: [LocationController],
  exports: [LocationService],
})
export class LocationModule {}
