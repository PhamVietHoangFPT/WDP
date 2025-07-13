import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { IServiceService } from './interfaces/iservice.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { CreateServiceDto } from './dto/createService.dto'
import { ServiceResponseDto } from './dto/serviceResponse.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { UpdateServiceDto } from './dto/updateService.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { FindAllServiceQueryDto } from './dto/find-all-service-query.dto'

@ApiTags('services')
@Controller('services')
export class ServiceController {
  constructor(
    @Inject(IServiceService)
    private readonly serviceService: IServiceService, // <-- Thay đổi cách inject
  ) { }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateServiceDto })
  @ApiOperation({ summary: 'Tạo dịch vụ mới' })
  create(@Body() createConditionDto: CreateServiceDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.serviceService.createService(user, createConditionDto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tìm loại của mẫu thử' })
  @ApiResponse({ status: HttpStatus.OK, type: ServiceResponseDto })
  async findById(@Param('id') id: string): Promise<ServiceResponseDto> {
    return await this.serviceService.findServiceById(id)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả dịch vụ' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Số lượng mục trên mỗi trang' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, description: 'Số trang' })
  @ApiQuery({ name: 'isAgnate', required: false, type: Boolean, description: 'Là quan hệ huyết thống' })
  @ApiQuery({ name: 'isAdministration', required: false, type: Boolean, description: 'Là hành chính' })
  @ApiQuery({ name: 'isSelfSampling', required: false, type: Boolean, description: 'Tự lấy mẫu' })
  @ApiQuery({
    name: 'timeReturn',
    required: false,
    type: Number,
    description: 'Thời gian trả kết quả',
  })
  @ApiQuery({
    name: 'sampleName',
    required: false,
    type: String,
    description: 'Tên mẫu (Sample)',
  })
  @ApiQuery({
    name: 'sampleTypeId',
    required: false,
    type: String,
    description: 'ID loại mẫu (SampleType)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Tên dịch vụ (Service.name)',
  })

  @ApiResponse({ status: HttpStatus.OK, type: [ServiceResponseDto] })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: FindAllServiceQueryDto,
  ) {
    const { pageNumber, pageSize, ...filters } = query;

    return this.serviceService.findAllService(
      pageNumber || 1,
      pageSize || 10,
      filters,
    );
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Put(':id')
  @ApiBody({ type: UpdateServiceDto })
  @ApiOperation({ summary: 'Thay đổi thông tin dịch vụ' })
  @ApiResponse({ status: HttpStatus.OK, type: ServiceResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.serviceService.updateService(id, user, updateServiceDto)
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa dịch vụ' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.serviceService.deleteService(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa dịch vụ thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
