import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Delete,
  NotFoundException,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiTags,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ImageUploadService } from './imageUpload.service'
import { Types } from 'mongoose'
import { AuthGuard } from 'src/common/guard/auth.guard'

@ApiTags('Images')
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
        file: { type: 'string', format: 'binary' },
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

  @Get()
  async findAll() {
    return this.uploadService.findAll()
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiParam({ name: 'id', required: true })
  async delete(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID')
    const deleted = await this.uploadService.deleteById(id)
    if (!deleted)
      throw new NotFoundException('Image not found or already deleted')
    return { message: 'Image deleted successfully' }
  }

  @Get('deleted')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  async findDeleted() {
    return this.uploadService.findDeleted()
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  async findById(@Param('id') id: string) {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid ID')
    const image = await this.uploadService.findById(id)
    if (!image) throw new NotFoundException('Image not found')
    return image
  }
}
