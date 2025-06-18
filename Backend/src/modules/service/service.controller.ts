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
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('Services')
@Controller('services')
export class ServiceController {
  constructor(
    @Inject(IServiceService)
    private readonly serviceService: IServiceService, // <-- Thay đổi cách inject
  ) {}

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
  @ApiOperation({ summary: 'Xem tất cả loại của mẫu thử' })
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
  @ApiResponse({ status: HttpStatus.OK, type: [ServiceResponseDto] })
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
    const result = await this.serviceService.findAllService(
      pageNumber || 1,
      pageSize || 10,
    )
    return result
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
