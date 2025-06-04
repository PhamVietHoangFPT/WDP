import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiBody } from '@nestjs/swagger'
import { ImageUploadService } from './imageUpload.service'

@Controller('images')
export class ImageController {
  constructor(private readonly uploadService: ImageUploadService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded')

    const result = await this.uploadService.uploadFile(file)

    return {
      message: 'File uploaded successfully',
      fileName: file.originalname,
      imageUrl: result.url,
    }
  }
}
