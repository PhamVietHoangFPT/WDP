import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Blog, BlogDocument } from './schemas/blog.schema'
import { CreateBlogDto } from './dto/createBlog.dto'
import { UpdateBlogDto } from './dto/updateBlog.dto'
import { IBlogRepository } from './interfaces/iblog.repository'

@Injectable()
export class BlogRepository implements IBlogRepository {
  constructor(
    @InjectModel(Blog.name) private readonly model: Model<BlogDocument>,
  ) {}

  async create(data: CreateBlogDto): Promise<Blog> {
    return this.model.create(data)
  }

  async findAll(): Promise<Blog[]> {
    return this.model
      .find({ isDeleted: false })
      .populate('account', 'name email')
      .populate('image', 'url')
      .lean()
      .exec()
  }

  async findById(id: string): Promise<Blog | null> {
    return this.model
      .findById(id)
      .populate({ path: 'account', select: 'name email' })
      .populate({ path: 'image', select: 'url' })
      .lean()
      .exec()
  }

  async update(id: string, dto: UpdateBlogDto): Promise<Blog | null> {
    return this.model
      .findByIdAndUpdate(id, dto, { new: true })
      .populate({ path: 'account', select: 'name email' })
      .populate({ path: 'image', select: 'url' })
      .lean()
      .exec()
  }

  async save(blog: BlogDocument): Promise<Blog> {
    return blog.save()
  }

  async findDeleted(): Promise<Blog[]> {
    return this.model.find({ isDeleted: true }).exec()
  }
}
