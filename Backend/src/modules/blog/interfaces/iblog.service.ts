import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { BlogResponseDto } from '../dto/blogResponse.dto'
import { CreateBlogDto } from '../dto/createBlog.dto'
import { UpdateBlogDto } from '../dto/updateBlog.dto'

export interface IBlogService {
  create(dto: CreateBlogDto, userId: string): Promise<BlogResponseDto>
  findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<BlogResponseDto>>
  findById(id: string): Promise<BlogResponseDto>
  update(
    id: string,
    dto: UpdateBlogDto,
    userId: string,
  ): Promise<BlogResponseDto>
  deleted(id: string, userId: string): Promise<BlogResponseDto | null>
}

export const IBlogService = Symbol('IBlogService')
