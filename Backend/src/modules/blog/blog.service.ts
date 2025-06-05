import {
  Injectable,
  Inject,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { IBlogService } from './interfaces/iblog.service'
import { IBlogRepository } from './interfaces/iblog.repository'
import { CreateBlogDto } from './dto/createBlog.dto'
import { UpdateBlogDto } from './dto/updateBlog.dto'
import { BlogResponseDto } from './dto/blogResponse.dto'
import { Blog } from './schemas/blog.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

@Injectable()
export class BlogService implements IBlogService {
  private readonly logger = new Logger(BlogService.name)

  constructor(
    @Inject(IBlogRepository)
    private readonly blogRepository: IBlogRepository,
  ) {}

  private mapToResponseDto(blog: Blog): BlogResponseDto {
    return new BlogResponseDto({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      image: blog.image,
      account: blog.account,
    })
  }

  async create(dto: CreateBlogDto, userId: string): Promise<BlogResponseDto> {
    try {
      const created = await this.blogRepository.create(dto, userId)
      return this.mapToResponseDto(created)
    } catch (error) {
      this.logger.error('Error creating blog:', error)
      throw new InternalServerErrorException('Không thể tạo blog.')
    }
  }

  async findAll(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<BlogResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}
    // Fetch facilities and total count in parallel
    const [blogs, totalItems] = await Promise.all([
      this.blogRepository.findAll(filter).skip(skip).limit(pageSize).exec(),
      this.blogRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = blogs.map((blog: Blog) => this.mapToResponseDto(blog))
    return {
      data,
      pagination: {
        totalItems,
        pageSize,
        totalPages,
        currentPage: pageNumber,
      },
    }
  }

  async findById(id: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findById(id)
    if (!blog) {
      throw new NotFoundException(`Không tìm thấy blog với ID ${id}`)
    }
    return this.mapToResponseDto(blog)
  }

  async update(
    id: string,
    dto: UpdateBlogDto,
    userId: string,
  ): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.update(id, dto, userId)
    if (!blog) {
      throw new NotFoundException(`Không tìm thấy blog để cập nhật.`)
    }
    return this.mapToResponseDto(blog)
  }

  async deleted(id: string, userId: string): Promise<BlogResponseDto> {
    try {
      const blog = await this.blogRepository.delete(id, userId)
      if (!blog) {
        throw new NotFoundException(`Không tìm thấy blog để xóa.`)
      }
      return this.mapToResponseDto(blog)
    } catch (error) {
      this.logger.error('Error retrieving deleted blogs:', error)
      throw new InternalServerErrorException('Không thể truy vấn blog đã xóa.')
    }
  }
}
