import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Inject,
  UseGuards,
  Body,
  Req,
} from '@nestjs/common'
import { ISampleTypeService } from './interfaces/isampleType.service'
import { CreateSampleTypeDto } from './dto/createSampleType.dto'
import { UpdateSampleTypeDto } from './dto/updateSampleType.dto'
import { SampleTypeResponseDto } from './dto/sampleTypeResponse.dto'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
@ApiTags('sample-types')
@Controller('sample-types')
export class SampleTypeController {
  constructor(
    @Inject(ISampleTypeService)
    private readonly typeService: ISampleTypeService, // Inject the service
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tao mới kiểu mẫu xét nghiệm' })
  @ApiResponse({
    status: 201,
    description: 'Loại xét nghiệm đã được tạo thành công',
    type: ApiResponseDto<SampleTypeResponseDto>,
  })
  @ApiBody({ type: CreateSampleTypeDto })
  async create(
    @Body() createSampleTypeDto: CreateSampleTypeDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<SampleTypeResponseDto>> {
    const user = req.user.id
    const type = await this.typeService.create(createSampleTypeDto, user)
    return new ApiResponseDto<SampleTypeResponseDto>({
      statusCode: 201,
      message: 'Loại xét nghiệm đã được tạo thành công',
      data: [type],
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả kiểu mẫu xét nghiệm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả kiểu mẫu xét nghiệm',
    type: ApiResponseDto<SampleTypeResponseDto>,
  })
  async findAll(): Promise<ApiResponseDto<SampleTypeResponseDto>> {
    const types = await this.typeService.findAll()
    return new ApiResponseDto<SampleTypeResponseDto>({
      statusCode: 200,
      message: 'Danh sách tất cả kiểu mẫu xét nghiệm',
      data: types,
    })
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({ summary: 'Lấy kiểu mẫu xét nghiệm theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy kiểu mẫu xét nghiệm thành công',
    type: ApiResponseDto<SampleTypeResponseDto>,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<SampleTypeResponseDto>> {
    const type = await this.typeService.findById(id)
    return new ApiResponseDto<SampleTypeResponseDto>({
      statusCode: 200,
      message: 'Lấy kiểu mẫu xét nghiệm thành công',
      data: [type],
    })
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật kiểu mẫu xét nghiệm theo ID' })
  @ApiBody({ type: UpdateSampleTypeDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật kiểu mẫu xét nghiệm thành công',
    type: ApiResponseDto<SampleTypeResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateSampleTypeDto: UpdateSampleTypeDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<SampleTypeResponseDto>> {
    const user = req.user.id
    const updatedType = await this.typeService.update(
      id,
      updateSampleTypeDto,
      user,
    )
    return new ApiResponseDto<SampleTypeResponseDto>({
      statusCode: 200,
      message: 'Cập nhật kiểu mẫu xét nghiệm thành công',
      data: [updatedType],
    })
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa kiểu mẫu xét nghiệm theo ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 204,
    description: 'Xóa kiểu mẫu xét nghiệm thành công',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<null>> {
    const user = req.user.id
    await this.typeService.delete(id, user)
    return new ApiResponseDto<null>({
      statusCode: 204,
      message: 'Xóa kiểu mẫu xét nghiệm thành công',
      data: null,
    })
  }
}
