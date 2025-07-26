import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Inject,
  UseGuards,
  Body,
  Req,
  Query,
  ValidationPipe,
  Param,
} from '@nestjs/common'
import { ISamplingKitInventoryService } from './interfaces/isamplingKitInventory.service'
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { CreateSamplingKitInventoryDto } from './dto/createSamplingKitInventory.dto'
import { SamplingKitInventoryResponseDto } from './dto/samplingKitInventoryResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { FacilityAccessGuard } from 'src/common/guard/facility.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { UpdateInventoryDto } from './dto/updateInventory.dto'

@ApiTags('sampling-kit-inventory')
@Controller('sampling-kit-inventory')
export class SamplingKitInventoryController {
  constructor(
    @Inject(ISamplingKitInventoryService)
    private readonly samplingKitInventoryService: ISamplingKitInventoryService,
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
  @Roles(RoleEnum.MANAGER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo sample kit mới' })
  @ApiBody({
    type: CreateSamplingKitInventoryDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo mẫu kit thành công',
    type: ApiResponseDto<SamplingKitInventoryResponseDto>,
  })
  async create(
    @Body() createDto: CreateSamplingKitInventoryDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<SamplingKitInventoryResponseDto>> {
    const facilityId = req.user.facility._id
    const userId = req.user.id
    const result = await this.samplingKitInventoryService.create(
      createDto,
      facilityId,
      userId,
    )
    return {
      data: [result],
      message: 'Tạo mẫu kit thành công',
      statusCode: 201,
      success: true,
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả sample kit theo cơ sở' })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  @ApiQuery({
    name: 'facilityId',
    required: true,
    type: String,
    description: 'ID cơ sở y tế để lọc mẫu kit',
  })
  @ApiQuery({
    name: 'sampleId',
    required: false,
    type: String,
    description: 'ID mẫu để lọc các mẫu kit',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mẫu kit.',
    type: PaginatedResponseDto<SamplingKitInventoryResponseDto>,
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
    @Query('facilityId') facilityId: string,
    @Query('sampleId') sampleId?: string,
  ): Promise<PaginatedResponseDto<SamplingKitInventoryResponseDto>> {
    const { pageSize, pageNumber } = paginationQuery

    const samplingKitInventories =
      await this.samplingKitInventoryService.findAll(
        facilityId,
        pageNumber || 1,
        pageSize || 10,
        sampleId,
      )
    return {
      ...samplingKitInventories,
      data: samplingKitInventories.data.map(
        (samplingKitInventory) =>
          new SamplingKitInventoryResponseDto({
            ...samplingKitInventory,
          }),
      ),
      success: true,
      message: 'Lấy danh sách mẫu kit thành công',
      statusCode: 200,
    }
  }

  @Get('lot-number')
  @UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
  @Roles(RoleEnum.MANAGER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy mẫu kit theo lot number và cơ sở' })
  @ApiQuery({
    name: 'lotNumber',
    required: true,
    type: String,
    description: 'Số lot của mẫu kit',
  })
  @ApiQuery({
    name: 'facilityId',
    required: true,
    type: String,
    description: 'ID cơ sở y tế để lọc mẫu kit',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin mẫu kit theo lot number và cơ sở.',
    type: ApiResponseDto<SamplingKitInventoryResponseDto>,
  })
  async findByLotNumberAndFacility(
    @Query('lotNumber') lotNumber: string,
    @Query('facilityId') facilityId: string,
  ): Promise<ApiResponseDto<SamplingKitInventoryResponseDto | null>> {
    const samplingKitInventory =
      await this.samplingKitInventoryService.findByLotNumberAndFacility(
        lotNumber,
        facilityId,
      )
    if (!samplingKitInventory) {
      return new ApiResponseDto<SamplingKitInventoryResponseDto | null>({
        data: null,
        message: 'Không tìm thấy mẫu kit với lot number và cơ sở đã cho',
        statusCode: 404,
      })
    }
    return new ApiResponseDto<SamplingKitInventoryResponseDto>({
      data: [samplingKitInventory],
      message: 'Lấy thông tin mẫu kit theo lot number và cơ sở thành công',
      statusCode: 200,
    })
  }

  @Get('expired-kits')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.STAFF, RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy danh sách các mẫu kit đã hết hạn',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách các mẫu kit đã hết hạn.',
    type: PaginatedResponseDto<SamplingKitInventoryResponseDto>,
  })
  @ApiQuery({
    name: 'facilityId',
    required: true,
    type: String,
    description: 'ID cơ sở y tế để lọc mẫu kit đã hết hạn',
  })
  @ApiQuery({
    name: 'sampleId',
    required: false,
    type: String,
    description: 'ID mẫu để lọc các mẫu kit đã hết hạn',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Số lượng mục trên mỗi trang',
  })
  @ApiQuery({
    name: 'pageNumber',
    required: false,
    type: Number,
    description: 'Số trang',
  })
  async findAllExpiredKits(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
    @Query('facilityId') facilityId: string,
    @Query('sampleId') sampleId?: string,
  ): Promise<PaginatedResponseDto<SamplingKitInventoryResponseDto>> {
    const { pageSize, pageNumber } = paginationQuery
    const samplingKitInventories =
      await this.samplingKitInventoryService.findAllExpiredKits(
        facilityId,
        pageNumber || 1,
        pageSize || 10,
        sampleId,
      )
    return {
      ...samplingKitInventories,
      data: samplingKitInventories.data.map(
        (samplingKitInventory) =>
          new SamplingKitInventoryResponseDto({
            ...samplingKitInventory,
          }),
      ),
      success: true,
      message: 'Lấy danh sách các mẫu kit đã hết hạn thành công',
      statusCode: 200,
    }
  }

  @Get('sample-and-facility')
  @ApiOperation({
    summary: 'Lấy mẫu kit theo ID mẫu và ID cơ sở',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin mẫu kit theo ID mẫu và ID cơ sở.',
    type: ApiResponseDto<SamplingKitInventoryResponseDto | null>,
  })
  @ApiQuery({
    name: 'sampleId',
    required: true,
    type: String,
    description: 'ID mẫu để lọc các mẫu kit',
  })
  @ApiQuery({
    name: 'facilityId',
    required: true,
    type: String,
    description: 'ID cơ sở y tế để lọc mẫu kit',
  })
  async findBySampleIdAndFacilityId(
    @Query('sampleId') sampleId: string,
    @Query('facilityId') facilityId: string,
  ): Promise<ApiResponseDto<SamplingKitInventoryResponseDto | null>> {
    const samplingKitInventory =
      await this.samplingKitInventoryService.findBySampleIdAndFacilityId(
        sampleId,
        facilityId,
      )
    return new ApiResponseDto<SamplingKitInventoryResponseDto>({
      data: [samplingKitInventory],
      message: 'Lấy thông tin mẫu kit theo ID mẫu và ID cơ sở thành công',
      statusCode: 200,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin sample kit theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin mẫu kit.',
    type: ApiResponseDto<SamplingKitInventoryResponseDto>,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<SamplingKitInventoryResponseDto>> {
    const result = await this.samplingKitInventoryService.findById(id)
    return new ApiResponseDto<SamplingKitInventoryResponseDto>({
      data: [result],
      message: 'Lấy thông tin mẫu kit thành công',
      statusCode: 200,
    })
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
  @Roles(RoleEnum.MANAGER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin sample kit theo ID' })
  @ApiBody({
    type: CreateSamplingKitInventoryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật mẫu kit thành công',
    type: ApiResponseDto<SamplingKitInventoryResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<SamplingKitInventoryResponseDto>> {
    const facilityId = req.user.facility._id
    const userId = req.user.id
    const result = await this.samplingKitInventoryService.update(
      id,
      facilityId,
      userId,
      updateInventoryDto,
    )
    return new ApiResponseDto<SamplingKitInventoryResponseDto>({
      data: [result],
      message: 'Cập nhật mẫu kit thành công',
      statusCode: 200,
    })
  }

  @Delete('expired')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa các mẫu kit đã hết hạn' })
  @ApiResponse({
    status: 204,
    description: 'Xóa các mẫu kit đã hết hạn thành công',
  })
  async deleteExpiredSamplingKits() {
    await this.samplingKitInventoryService.deleteExpiredSamplingKits()
    return {
      message: 'Xóa các mẫu kit đã hết hạn thành công',
      statusCode: 204,
      success: true,
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
  @Roles(RoleEnum.MANAGER, RoleEnum.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa sample kit theo ID' })
  async delete(@Param('id') id: string, @Req() req: any): Promise<void> {
    const userId = req.user.id
    const result = await this.samplingKitInventoryService.delete(id, userId)
    if (!result) {
      throw new Error(`Không tìm thấy mẫu kit với ID ${id}`)
    }
    return
  }
}
