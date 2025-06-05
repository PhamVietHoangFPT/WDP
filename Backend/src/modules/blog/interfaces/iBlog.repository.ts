import { Blog } from '../schemas/blog.schema'
import { CreateBlogDto } from '../dto/createBlog.dto'
import { UpdateBlogDto } from '../dto/updateBlog.dto'

export interface IBlogRepository {
  create(dto: CreateBlogDto): Promise<Blog>
  findAll(): Promise<Blog[]>
  findById(id: string): Promise<Blog | null>
  update(id: string, dto: UpdateBlogDto): Promise<Blog | null>
  save(blog: Blog): Promise<Blog>
  findDeleted(): Promise<Blog[]>
}
export const IBlogRepository = Symbol('IBlogRepository')
