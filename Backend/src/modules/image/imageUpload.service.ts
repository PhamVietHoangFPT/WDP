import { Injectable, NotFoundException } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { Image, ImageDocument } from './schemas/image.schemas'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { IImageUploadService } from './interfaces/iImageUpload.service'
import { CreateBlogImageDto } from './dto/createImage.dto'
import { IImageUploadRepository } from './interfaces/iimageUpload.repository'

@Injectable()
export class ImageUploadService implements IImageUploadService {
  constructor(
    @Inject(IImageUploadRepository)
    private readonly imageModel: IImageUploadRepository,
  ) {}

  async uploadFileForBlog(
    file: Express.Multer.File,
    createBlogImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<{ url: string; _id: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const fileName = `${uuidv4()}-${file.originalname}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    const url = `/uploads/${fileName}`

    const saved: ImageDocument = await this.imageModel.createForBlog(
      url,
      createBlogImageDto,
      userId,
    )

    return {
      url: saved.url,
      _id: saved.id.toString(),
    }
  }

  async findAllForBlog(blogId: string): Promise<Image[]> {
    return this.imageModel.findAllImageForBlog(blogId)
  }

  async findById(id: string): Promise<Image | null> {
    const data = await this.imageModel.findById(id)
    if (!data) {
      throw new NotFoundException('Ảnh không tồn tại')
    }
    return data
  }

  async deleteById(id: string, userId: string): Promise<boolean> {
    const deletedImage = await this.imageModel.findById(id)
    if (!deletedImage) {
      throw new NotFoundException('Ảnh không tồn tại hoặc đã bị xóa')
    }
    await this.imageModel.deleteById(id, userId)
    return true
  }
}
