import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Image, ImageDocument } from './schemas/image.schemas'
import { IImageUploadRepository } from './interfaces/iimageUpload.repository'
import { CreateBlogImageDto } from './dto/createImage.dto'

@Injectable()
export class ImageUploadRepository implements IImageUploadRepository {
  constructor(
    @InjectModel(Image.name)
    private imageModel: Model<ImageDocument>,
  ) {}

  async createForBlog(
    url: string,
    createImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<ImageDocument> {
    const newImage = new this.imageModel({ ...createImageDto, url })
    const createdByUser = new mongoose.Types.ObjectId(userId) as any
    newImage.created_by = createdByUser
    return await newImage.save()
  }

  async findById(id: string): Promise<ImageDocument | null> {
    return this.imageModel.findOne({ id: id, deleted_at: null }).exec()
  }

  async findAllImageForBlog(blogId: string): Promise<ImageDocument[]> {
    return this.imageModel.find({ blog: blogId, deleted_at: null }).exec()
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
