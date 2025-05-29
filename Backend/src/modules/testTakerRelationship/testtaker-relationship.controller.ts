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
  UseInterceptors,
  ClassSerializerInterceptor,
  Req,
  Query,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger'

import { ITestTakerRelationshipService } from './interfaces/itestTakerRelationship.service'
import { CreateTestTakerRelationshipDto } from './dto/create-testtaker-relationship.dto'
import { TestTakerRelationshipResponseDto } from './dto/testtaker-relationship-response.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'

@ApiTags('test-taker-relationships')
@Controller('test-taker-relationships')
@UseInterceptors(ClassSerializerInterceptor)
export class TestTakerRelationshipController {
  constructor(
    @Inject(ITestTakerRelationshipService)
    private readonly relationshipService: ITestTakerRelationshipService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mối quan hệ TestTaker' })
  @ApiBody({ type: CreateTestTakerRelationshipDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<TestTakerRelationshipResponseDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateTestTakerRelationshipDto,
  ): Promise<ApiResponseDto<TestTakerRelationshipResponseDto>> {
    const created = await this.relationshipService.create(dto)
    return new ApiResponseDto({
      data: [created],
      success: true,
      message: 'Tạo mối quan hệ thành công',
      statusCode: HttpStatus.CREATED,
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mối quan hệ' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedResponseDto<TestTakerRelationshipResponseDto>,
  })
  async findAll(
    @Query('pageNumber') pageNumber = 1,
    @Query('pageSize') pageSize = 10,
  ): Promise<PaginatedResponseDto<TestTakerRelationshipResponseDto>> {
    const data = await this.relationshipService.findAll(pageNumber, pageSize)

    return {
      ...data,
      success: true,
      message: 'Lấy danh sách quan hệ thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy mối quan hệ theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<TestTakerRelationshipResponseDto>,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<TestTakerRelationshipResponseDto>> {
    const data = await this.relationshipService.findById(id)
    return new ApiResponseDto({
      data: [data],
      success: true,
      message: 'Lấy thông tin thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa mối quan hệ' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') @Req() req: any, id: string): Promise<void> {
    const userId = req.user.id
    await this.relationshipService.delete(id, userId)
  }
}
