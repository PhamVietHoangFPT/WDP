import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { Blog, BlogDocument } from './schemas/blog.schema'
import { CreateBlogDto } from './dto/createBlog.dto'
import { UpdateBlogDto } from './dto/updateBlog.dto'
import { IBlogRepository } from './interfaces/iblog.repository'

@Injectable()
export class BlogRepository implements IBlogRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly model: Model<BlogDocument>,
  ) {}

  async create(data: CreateBlogDto, userId: string): Promise<BlogDocument> {
    const createdBlog = await this.model.create({
      ...data,
      created_by: userId,
    })
    return createdBlog
  }

  findAll(
    filter: Record<string, unknown>,
  ): mongoose.Query<BlogDocument[], BlogDocument> {
    return this.model
      .find({ ...filter, deleted_at: null })
      .populate({ path: 'created_by', select: 'name email -_id' })
      .populate({ path: 'image', select: 'url deleted_at -_id' })
      .lean()
  }

  async findById(id: string): Promise<BlogDocument | null> {
    return this.model
      .findById(id)
      .populate({ path: 'created_by', select: 'name email -_id' })
      .populate({ path: 'image', select: 'url deleted_at -_id' })
      .lean()
      .exec()
  }

  async update(
    id: string,
    dto: UpdateBlogDto,
    userId: string,
  ): Promise<BlogDocument | null> {
    return this.model
      .findByIdAndUpdate(
        id,
        { ...dto, updated_by: userId, updated_at: Date.now() },
        { new: true },
      )
      .populate({ path: 'created_by', select: 'name email -_id' })
      .populate({ path: 'image', select: 'url -_id' })
      .lean()
      .exec()
  }

  async delete(id: string, userId: string): Promise<BlogDocument | null> {
    return this.model
      .findByIdAndUpdate(id, { deleted_at: Date.now(), deleted_by: userId })
      .exec()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.model.countDocuments({ deleted_at: null, ...filter }).exec()
  }

  async addImage(
    blogId: string,
    imageId: string,
  ): Promise<BlogDocument | null> {
    return this.model
      .findByIdAndUpdate(
        blogId,
        { $addToSet: { image: imageId } },
        { new: true },
      )
      .lean()
      .exec()
  }
}
