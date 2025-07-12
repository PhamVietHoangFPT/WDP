/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Get,
  Post,
  Body,
  // Delete,
  // Put,
  HttpCode,
  HttpStatus,
  Inject,
  Query,
  ValidationPipe,
  Param,
  Delete,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'

import { ISlotTemplateService } from './interfaces/islotTemplate.service'
import { CreateSlotTemplateDto } from './dto/createSlotTemplate.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { SlotTemplateResponseDto } from './dto/slotTemplateResponse.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'

@ApiTags('slot-templates')
@Controller('slot-templates')
export class SlotTemplateController {
  constructor(
    @Inject(ISlotTemplateService)
    private readonly slotTemplateService: ISlotTemplateService, // <-- Thay đổi cách inject
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Tạo mẫu khung giờ mới' })
  @ApiBody({ type: CreateSlotTemplateDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<CreateSlotTemplateDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async createSlotTemplate(
    @Body() createSlotTemplateDto: CreateSlotTemplateDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<CreateSlotTemplateDto>> {
    const userId = req.user.id as string
    const newSlotTemplateData: CreateSlotTemplateDto =
      await this.slotTemplateService.createSlotTemplate(
        createSlotTemplateDto,
        userId,
      )

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

  @Get('facility/:facilityId')
  @ApiOperation({
    summary: 'Lấy danh sách mẫu khung giờ theo cơ sở',
  })
  @ApiParam({ name: 'facilityId', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<SlotTemplateResponseDto>,
  })
  async findSlotByFacilityId(
    @Param('facilityId') facilityId: string,
  ): Promise<ApiResponseDto<SlotTemplateResponseDto>> {
    const slotTemplates =
      await this.slotTemplateService.findSlotByFacilityId(facilityId)
    return new ApiResponseDto<SlotTemplateResponseDto>({
      data: slotTemplates.map(
        (slotTemplate) => new SlotTemplateResponseDto(slotTemplate),
      ),
      success: true,
      message: 'Lấy danh sách mẫu khung giờ theo ID cơ sở thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cập nhật mẫu khung giờ theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: CreateSlotTemplateDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<CreateSlotTemplateDto>,
  })
  async updateSlotTemplate(
    @Param('id') id: string,
    @Body() updateSlotTemplateDto: CreateSlotTemplateDto,
    @Request() req: any,
  ): Promise<ApiResponseDto<CreateSlotTemplateDto>> {
    const userId = req.user.id as string
    const updatedSlotTemplateData =
      await this.slotTemplateService.updateSlotTemplate(
        id,
        updateSlotTemplateDto,
        userId,
      )
    return new ApiResponseDto<CreateSlotTemplateDto>({
      data: [updatedSlotTemplateData],
      success: true,
      message: 'Cập nhật mẫu khung giờ thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Xóa mẫu khung giờ theo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<null>,
  })
  async delete(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<ApiResponseDto<null>> {
    const userId = req.user.id as string
    await this.slotTemplateService.deleteSlotTemplate(id, userId)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa mẫu khung giờ thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
