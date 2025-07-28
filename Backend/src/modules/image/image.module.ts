import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { MongooseModule } from '@nestjs/mongoose'
import { Image, ImageSchema } from './schemas/image.schemas'
import { ImageUploadService } from './imageUpload.service'
import { ImageController } from './image.controller'
import { AuthModule } from '../auth/auth.module'
import { IImageUploadService } from './interfaces/iImageUpload.service'
import { BlogModule } from '../blog/blog.module'
import { IImageUploadRepository } from './interfaces/iimageUpload.repository'
import { ImageUploadRepository } from './imageUpload.repository'
import { KitShipmentModule } from '../KitShipment/kitShipment.module'
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'

@Module({
  imports: [
    MulterModule.register({}),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    AuthModule,
    BlogModule,
    KitShipmentModule,
    ServiceCaseModule,
  ],
  controllers: [ImageController],
  providers: [
    {
      provide: IImageUploadService,
      useClass: ImageUploadService,
    },
    {
      provide: IImageUploadRepository,
      useClass: ImageUploadRepository,
    },
  ],
  exports: [IImageUploadService],
})
export class ImageModule {}
