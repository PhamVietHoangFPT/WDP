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

@Injectable()
export class BlogService implements IBlogService {
  private readonly logger = new Logger(BlogService.name)

  constructor(
    @Inject(IBlogRepository)
    private readonly blogRepository: IBlogRepository,
  ) {}

  private mapToResponseDto(blog: Blog): BlogResponseDto {
    return new BlogResponseDto({
      ...blog,
      _id: blog._id,
    })
  }

  async create(dto: CreateBlogDto): Promise<BlogResponseDto> {
    try {
      const created = await this.blogRepository.create(dto)
      return this.mapToResponseDto(created)
    } catch (error) {
      this.logger.error('Error creating blog:', error)
      throw new InternalServerErrorException('Không thể tạo blog.')
    }
  }

  async findAll(): Promise<BlogResponseDto[]> {
    try {
      const blogs = await this.blogRepository.findAll()
      return blogs.map((b) => this.mapToResponseDto(b))
    } catch (error) {
      this.logger.error('Error retrieving blogs:', error)
      throw new InternalServerErrorException(
        'Không thể truy vấn danh sách blog.',
      )
    }
  }

  async findById(id: string): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.findById(id)
    if (!blog || blog.isDeleted) {
      throw new NotFoundException(`Không tìm thấy blog với ID ${id}`)
    }
    return this.mapToResponseDto(blog)
  }

  async update(id: string, dto: UpdateBlogDto): Promise<BlogResponseDto> {
    const blog = await this.blogRepository.update(id, dto)
    if (!blog || blog.isDeleted) {
      throw new NotFoundException(`Không tìm thấy blog để cập nhật.`)
    }
    return this.mapToResponseDto(blog)
  }

  async softDelete(id: string): Promise<void> {
    const blog = await this.blogRepository.findById(id)
    if (!blog || blog.isDeleted) {
      throw new NotFoundException('Blog not found or already deleted')
    }
    blog.isDeleted = true
    await this.blogRepository.save(blog)
  }

  async findDeleted(): Promise<BlogResponseDto[]> {
    try {
      const blogs = await this.blogRepository.findDeleted()
      return blogs.map((b) => this.mapToResponseDto(b))
    } catch (error) {
      this.logger.error('Error retrieving deleted blogs:', error)
      throw new InternalServerErrorException('Không thể truy vấn blog đã xóa.')
    }
  }
}
