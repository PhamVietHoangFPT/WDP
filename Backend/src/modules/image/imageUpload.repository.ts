/* eslint-disable @typescript-eslint/no-base-to-string */
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Image, ImageDocument } from './schemas/image.schemas'
import { IImageUploadRepository } from './interfaces/iimageUpload.repository'
import { CreateBlogImageDto } from './dto/createImage.dto'
import { IBlogRepository } from '../blog/interfaces/iblog.repository'
import { CreateImageKitShipmentDto } from './dto/createImageShipment.dto'
import { CreateImageResultDto } from './dto/createResult.dto'

@Injectable()
export class ImageUploadRepository implements IImageUploadRepository {
  constructor(
    @InjectModel(Image.name)
    private imageModel: Model<ImageDocument>,
    @Inject(IBlogRepository)
    private blogRepository: IBlogRepository,
  ) {}
  async createImageForResult(
    url: string,
    createImageDto: CreateImageResultDto,
    userId: string,
  ): Promise<ImageDocument> {
    const createdByUser = new mongoose.Types.ObjectId(userId) as any
    const newImage = new this.imageModel({
      ...createImageDto,
      url,
      created_by: createdByUser,
      created_at: new Date(),
    })
    return await newImage.save()
  }

  async createImageForKitShipmemt(
    url: string,
    createImageDto: CreateImageKitShipmentDto,
    userId: string,
  ): Promise<ImageDocument> {
    const createdByUser = new mongoose.Types.ObjectId(userId) as any
    const newImage = new this.imageModel({
      ...createImageDto,
      url,
      created_by: createdByUser,
      created_at: new Date(),
    })
    return await newImage.save()
  }

  async createForBlog(
    url: string,
    createImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<ImageDocument> {
    const newImage = new this.imageModel({ ...createImageDto, url })
    const createdByUser = new mongoose.Types.ObjectId(userId) as any
    await this.blogRepository.addImage(
      createImageDto.blog,
      newImage._id.toString(),
    )
    newImage.created_by = createdByUser
    return await newImage.save()
  }

  async findById(id: string): Promise<ImageDocument | null> {
    return await this.imageModel.findOne({ _id: id, deleted_at: null }).exec()
  }

  async findAllImageForBlog(blogId: string): Promise<ImageDocument[]> {
    return await this.imageModel.find({ blog: blogId, deleted_at: null }).exec()
  }
  async findAllImageForKitShipment(
    kitShipmentId: string,
  ): Promise<ImageDocument[]> {
    return await this.imageModel
      .find({ kitShipment: kitShipmentId, deleted_at: null })
      .exec()
  }

  async findAllImageForResult(resultId: string): Promise<ImageDocument[]> {
    return await this.imageModel
      .find({ result: resultId, deleted_at: null })
      .exec()
  }

  async deleteById(id: string, userId: string): Promise<ImageDocument | null> {
    const result = await this.imageModel
      .findOneAndUpdate(
        { _id: id },
        { deleted_at: new Date(), deleted_by: userId },
        { new: true },
      )
      .exec()
    return result
  }
}
