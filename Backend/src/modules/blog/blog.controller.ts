import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger'
import { CreateBlogDto } from './dto/createBlog.dto'
import { UpdateBlogDto } from './dto/updateBlog.dto'
import { BlogResponseDto } from './dto/blogResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { IBlogService } from './interfaces/iblog.service'

@ApiTags('blogs')
@Controller('blogs')
@UseInterceptors(ClassSerializerInterceptor)
export class BlogController {
  constructor(
    @Inject(IBlogService)
    private readonly blogService: IBlogService,
  ) {}

  @Post()
  //   @UseGuards(AuthGuard)
  //   @ApiBearerAuth('brear')
  @ApiOperation({ summary: 'Tạo blog mới' })
  async create(@Body() createBlogDto: CreateBlogDto) {
    const blog = await this.blogService.create(createBlogDto)
    return new BlogResponseDto(blog)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách blog' })
  async findAll() {
    const blogs = await this.blogService.findAll()
    return blogs.map((blog) => new BlogResponseDto(blog))
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Lấy blog theo ID' })
  async findOne(@Param('id') id: string) {
    const blog = await this.blogService.findById(id)
    return new BlogResponseDto(blog)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Cập nhật blog' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto) {
    const blog = await this.blogService.update(id, dto)
    return new BlogResponseDto(blog)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Xóa mềm blog' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.blogService.softDelete(id)
  }
}
