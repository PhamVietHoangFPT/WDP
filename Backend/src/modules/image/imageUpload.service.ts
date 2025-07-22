import { Injectable, NotFoundException } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { Image, ImageDocument } from './schemas/image.schemas'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'
import { IImageUploadService } from './interfaces/iImageUpload.service'
import { CreateBlogImageDto } from './dto/createImage.dto'
import { IImageUploadRepository } from './interfaces/iimageUpload.repository'
import { IBlogRepository } from '../blog/interfaces/iblog.repository'
import { IKitShipmentRepository } from '../KitShipment/interfaces/ikitShipment.repository'
import { CreateImageKitShipmentDto } from './dto/createImageShipment.dto'
import { CreateImageResultDto } from './dto/createResult.dto'

@Injectable()
export class ImageUploadService implements IImageUploadService {
  constructor(
    @Inject(IImageUploadRepository)
    private readonly imageModel: IImageUploadRepository,
    @Inject(IBlogRepository)
    private readonly blogRepository: IBlogRepository,
    @Inject(IKitShipmentRepository)
    private readonly kitShipmentRepository: IKitShipmentRepository,
  ) {}

  async uploadFileForBlog(
    file: Express.Multer.File,
    createBlogImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<{ url: string; _id: string }> {
    const blog = await this.blogRepository.findById(createBlogImageDto.blog)
    if (!blog) {
      throw new NotFoundException('Blog không tồn tại')
    }
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

  async uploadFileForShipment(
    file: Express.Multer.File,
    createImageKitShipmentDto: CreateImageKitShipmentDto,
    userId: string,
  ): Promise<{ url: string; _id: string }> {
    const kitShipment = await this.kitShipmentRepository.findById(
      createImageKitShipmentDto.kitShipment,
    )
    if (!kitShipment) {
      throw new NotFoundException('Kit shipment không tồn tại')
    }
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const fileName = `${uuidv4()}-${file.originalname}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    const url = `/uploads/${fileName}`

    const saved: ImageDocument =
      await this.imageModel.createImageForKitShipmemt(
        url,
        createImageKitShipmentDto,
        userId,
      )

    return {
      url: saved.url,
      _id: saved.id.toString(),
    }
  }

  async uploadFileForResult(
    file: Express.Multer.File,
    createImageResultDto: CreateImageResultDto,
    userId: string,
  ): Promise<{ url: string; _id: string }> {
    const kitShipment = await this.kitShipmentRepository.findById(
      createImageResultDto.result,
    )
    if (!kitShipment) {
      throw new NotFoundException('Result không tồn tại')
    }
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const fileName = `${uuidv4()}-${file.originalname}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    const url = `/uploads/${fileName}`

    const saved: ImageDocument = await this.imageModel.createImageForResult(
      url,
      createImageResultDto,
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
  async findAllForKitShipment(kitShipmentId: string): Promise<Image[]> {
    return this.imageModel.findAllImageForKitShipment(kitShipmentId)
  }
  async findAllForResult(resultId: string): Promise<Image[]> {
    return this.imageModel.findAllImageForResult(resultId)
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
