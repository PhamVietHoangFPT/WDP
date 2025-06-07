import { BlogDocument } from '../schemas/blog.schema'
import { CreateBlogDto } from '../dto/createBlog.dto'
import { UpdateBlogDto } from '../dto/updateBlog.dto'
import mongoose from 'mongoose'

export interface IBlogRepository {
  create(dto: CreateBlogDto, userId: string): Promise<BlogDocument>
  findAll(
    filter: Record<string, unknown>,
  ): mongoose.Query<BlogDocument[], BlogDocument>
  findById(id: string): Promise<BlogDocument | null>
  update(
    id: string,
    dto: UpdateBlogDto,
    userId: string,
  ): Promise<BlogDocument | null>
  delete(id: string, userId: string): Promise<BlogDocument | null>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  addImage(blogId: string, imageId: string): Promise<BlogDocument | null>
}
export const IBlogRepository = Symbol('IBlogRepository')
