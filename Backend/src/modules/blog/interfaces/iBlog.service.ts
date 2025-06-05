import { BlogResponseDto } from '../dto/blogResponse.dto'
import { CreateBlogDto } from '../dto/createBlog.dto'
import { UpdateBlogDto } from '../dto/updateBlog.dto'

export interface IBlogService {
  create(dto: CreateBlogDto): Promise<BlogResponseDto>
  findAll(): Promise<BlogResponseDto[]>
  findById(id: string): Promise<BlogResponseDto>
  update(id: string, dto: UpdateBlogDto): Promise<BlogResponseDto>
  softDelete(id: string): Promise<void>
  findDeleted(): Promise<BlogResponseDto[]>
}

export const IBlogService = Symbol('IBlogService')
