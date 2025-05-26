import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Inject,
  Query,
  Req,
  UseGuards,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common'

import { IFacilityService } from './interfaces/ifacility.service'
import { CreateFacilityDto } from './dto/createFacility.dto'
import { FacilityResponseDto } from './dto/facilityResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger'
import { Facility } from './schemas/facility.schema'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { RoleEnum } from 'src/common/enums/role.enum'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { Roles } from 'src/common/decorators/roles.decorator'
import { UpdateFacilityDto } from './dto/updateFacility.dto'

@ApiTags('facilities')
@Controller('facilities')
export class FacilityController {
  constructor(
    @Inject(IFacilityService)
    private readonly facilityService: IFacilityService,
  ) {}

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Tạo mới cơ sở' })
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(
    @Body() createFacilityDto: CreateFacilityDto,
    @Req() req: any,
  ): Promise<FacilityResponseDto> {
    return this.facilityService.create(createFacilityDto, req.user._id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin cơ sở theo ID' })
  findById(@Param('id') id: string): Promise<FacilityResponseDto | null> {
    return this.facilityService.findById(id)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách cơ sở' })
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
    description: 'Danh sách các cơ sở',
    type: ApiResponseDto<PaginatedResponse<FacilityResponseDto>>,
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
  ): Promise<PaginatedResponseDto<FacilityResponseDto>> {
    const { pageNumber, pageSize } = paginationQuery

    const facilities = await this.facilityService.findAll(
      pageNumber || 1,
      pageSize || 10,
    )

    return {
      ...facilities,
      data: facilities.data.map(
        (facility) => new FacilityResponseDto({ ...facility }),
      ),
      success: true,
      message: 'Lấy danh sách cơ sở thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @Put(':id')
  @ApiBody({ type: UpdateFacilityDto })
  @ApiOperation({ summary: 'Cập nhật cơ sở theo ID' })
  update(
    @Param('id') id: string,
    @Body() updateFacilityDto: Partial<Facility>,
    @Req() req: any,
  ): Promise<ApiResponseDto<FacilityResponseDto> | null> {
    const result = this.facilityService.update(
      id,
      updateFacilityDto,
      req.user._id,
    )
    return result.then((facility) => {
      if (!facility) {
        return null
      }
      return {
        data: [facility],
        success: true,
        message: 'Cập nhật cơ sở thành công',
        statusCode: HttpStatus.OK,
      }
    })
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cơ sở theo ID' })
  delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<FacilityResponseDto | null> {
    return this.facilityService.delete(id, req.user._id)
  }
}
