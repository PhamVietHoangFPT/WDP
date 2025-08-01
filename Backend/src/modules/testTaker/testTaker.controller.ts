import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'

import { ITestTakerService } from './interfaces/itestTaker.service'
import { CreateTestTakerDto } from './dto/createTestTaker.dto'
import { TestTakerResponseDto } from './dto/testTakerResponse.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { QueryTestTakerDto } from './dto/queryTestTaker.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('test-takers')
@Controller('test-takers')
export class TestTakerController {
  constructor(
    @Inject(ITestTakerService)
    private readonly testTakerService: ITestTakerService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Tạo test taker mới' })
  @ApiBody({ type: CreateTestTakerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<TestTakerResponseDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateTestTakerDto,
    @Req() req: any, // Lấy thông tin người dùng từ request
  ): Promise<ApiResponseDto<TestTakerResponseDto>> {
    const userId = req.user.id // Giả sử bạn đã xác thực người dùng và có ID trong req.user
    const newData = await this.testTakerService.create(createDto, userId)
    return new ApiResponseDto<TestTakerResponseDto>({
      data: [newData],
      success: true,
      message: 'Test taker được tạo thành công',
      statusCode: HttpStatus.CREATED,
    })
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Lấy danh sách test takers' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'accountId', required: true, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<TestTakerResponseDto>,
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: QueryTestTakerDto & PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>> {
    const { pageNumber = 1, pageSize = 10, ...filterQuery } = query
    const result = await this.testTakerService.findAll(
      filterQuery, // ✅ query điều kiện lọc
      pageNumber,
      pageSize,
    )

    return {
      ...result,
      data: result.data.map((item) => new TestTakerResponseDto(item)),
      success: true,
      message: 'Lấy danh sách test takers thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get('served')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Lấy danh sách test takers đã phục vụ' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'accountId', required: true, type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<TestTakerResponseDto>,
  })
  async findAllDeleted(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: QueryTestTakerDto & PaginationQueryDto,
  ): Promise<PaginatedResponseDto<TestTakerResponseDto>> {
    const { pageNumber = 1, pageSize = 10, ...filterQuery } = query
    const result = await this.testTakerService.findAllDeleted(
      filterQuery, // ✅ query điều kiện lọc
      pageNumber,
      pageSize,
    )
    return {
      ...result,
      data: result.data.map((item) => new TestTakerResponseDto(item)),
      success: true,
      message: 'Lấy danh sách test takers đã phục vụ thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Lấy test taker theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<TestTakerResponseDto>,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<TestTakerResponseDto>> {
    const data = await this.testTakerService.findById(id)
    return {
      data: [new TestTakerResponseDto(data)],
      message: 'Lấy test taker thành công',
      success: true,
      statusCode: HttpStatus.OK,
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Xóa test taker' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa test taker thành công.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy test taker.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.testTakerService.remove(id)
  }
}
