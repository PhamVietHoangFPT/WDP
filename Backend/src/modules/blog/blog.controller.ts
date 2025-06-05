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
  Inject,
  Query,
  ValidationPipe,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'
import { CreateBlogDto } from './dto/createBlog.dto'
import { UpdateBlogDto } from './dto/updateBlog.dto'
import { BlogResponseDto } from './dto/blogResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { IBlogService } from './interfaces/iblog.service'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('blogs')
@Controller('blogs')
export class BlogController {
  constructor(
    @Inject(IBlogService)
    private readonly blogService: IBlogService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo blog mới' })
  async create(@Body() createBlogDto: CreateBlogDto, @Req() user: any) {
    const userId = user?.id || user?._id
    const blog = await this.blogService.create(createBlogDto, userId)
    return new BlogResponseDto(blog)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách blog' })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách các blog',
    type: ApiResponseDto<PaginatedResponse<BlogResponseDto>>,
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
  ) {
    const { pageNumber, pageSize } = paginationQuery

    const blogs = await this.blogService.findAll(
      pageNumber || 1,
      pageSize || 10,
    )

    return {
      ...blogs,
      data: blogs.data.map((blog) => new BlogResponseDto({ ...blog })),
      success: true,
      message: 'Lấy danh sách blog thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Lấy blog theo ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách các blog',
    type: BlogResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const blog = await this.blogService.findById(id)
    return new BlogResponseDto(blog)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Cập nhật blog' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách các blog',
    type: BlogResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogDto,
    @Req() user: any,
  ) {
    const userId = user?.id || user?._id
    const blog = await this.blogService.update(id, dto, userId)
    return new BlogResponseDto(blog)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: String })
  @ApiOperation({ summary: 'Xóa mềm blog' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() user: any) {
    const userId = user?.id || user?._id
    await this.blogService.deleted(id, userId)
  }
}
