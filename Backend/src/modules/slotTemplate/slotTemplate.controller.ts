import {
  Controller,
  Get,
  Post,
  Body,
  // Delete,
  // Put,
  HttpCode,
  HttpStatus,
  Inject, // <-- Thêm Inject
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  ValidationPipe,
  Param,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'

import { ISlotTemplateService } from './interfaces/islotTemplate.service'
import { CreateSlotTemplateDto } from './dto/CreateSlotTemplate.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { SlotTemplateResponseDto } from './dto/SlotTemplateResponse.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'

@ApiTags('slotTemplates')
@Controller('slotTemplates')
@UseInterceptors(ClassSerializerInterceptor)
export class SlotTemplateController {
  constructor(
    @Inject(ISlotTemplateService)
    private readonly slotTemplateService: ISlotTemplateService, // <-- Thay đổi cách inject
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo mẫu khung giờ mới' })
  @ApiBody({ type: CreateSlotTemplateDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<CreateSlotTemplateDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async createSlotTemplate(
    @Body() createSlotTemplateDto: CreateSlotTemplateDto,
  ): Promise<ApiResponseDto<CreateSlotTemplateDto>> {
    const newSlotTemplateData: CreateSlotTemplateDto =
      await this.slotTemplateService.createSlotTemplate(createSlotTemplateDto)
    return new ApiResponseDto<CreateSlotTemplateDto>({
      data: [newSlotTemplateData],
      success: true,
      message: 'Mẫu khung giờ được tạo thành công',
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin mẫu khung giờ theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<CreateSlotTemplateDto>,
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<CreateSlotTemplateDto>> {
    const slotTemplate = await this.slotTemplateService.findSlotTemplateById(id)
    return new ApiResponseDto<CreateSlotTemplateDto>({
      data: [slotTemplate],
      success: true,
      message: 'Lấy thông tin mẫu khung giờ thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách mẫu khung giờ' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang (mặc định: -1)',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang (mặc định: -1)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mẫu khung giờ.',
    type: PaginatedResponseDto<SlotTemplateResponseDto>,
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
  ): Promise<PaginatedResponseDto<SlotTemplateResponseDto>> {
    const { pageNumber, pageSize } = paginationQuery

    const slotTemplates = await this.slotTemplateService.findAllSlotTemplates(
      pageNumber || 1,
      pageSize || 10,
    )

    return {
      ...slotTemplates,
      data: slotTemplates.data.map(
        (slotTemplate) => new SlotTemplateResponseDto({ ...slotTemplate }),
      ),
      success: true,
      message: 'Lấy danh sách mẫu khung giờ thành công',
      statusCode: HttpStatus.OK,
    }
  }
}
