import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { MongooseModule } from '@nestjs/mongoose'
import { Image, ImageSchema } from './schemas/image.schemas'
import { ImageUploadService } from './imageUpload.service'
import { ImageController } from './image.controller'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [
    MulterModule.register({}),
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    AuthModule,
  ],
  controllers: [ImageController],
  providers: [ImageUploadService],
})
export class ImageModule {}
