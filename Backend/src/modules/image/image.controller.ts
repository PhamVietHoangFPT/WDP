import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Delete,
  UseGuards,
  Body,
  Inject,
  Req,
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
import { AuthGuard } from 'src/common/guard/auth.guard'
import { CreateBlogImageDto } from './dto/createImage.dto'
import { IImageUploadService } from './interfaces/iImageUpload.service'

@ApiTags('Images')
@Controller('images')
export class ImageController {
  constructor(
    @Inject(IImageUploadService)
    private readonly uploadService: ImageUploadService,
  ) {}

  @Post('uploadForBlog')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        blog: { type: 'string' },
      },
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateBlogImageDto,
    @Req() req: any,
  ) {
    if (!file) throw new BadRequestException('No file uploaded')
    const userId = req.user.id
    const result = await this.uploadService.uploadFileForBlog(
      file,
      body,
      userId,
    )
    return {
      message: 'File uploaded successfully',
      fileName: file.originalname,
      imageUrl: result.url,
    }
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  async findById(@Param('id') id: string) {
    const image = await this.uploadService.findById(id)
    return image
  }

  @Get('findForBlog/:blogId')
  async findAllForBlog(@Param('blogId') blogId: string) {
    return this.uploadService.findAllForBlog(blogId)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiParam({ name: 'id', required: true })
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id
    return await this.uploadService.deleteById(id, userId)
  }
}
