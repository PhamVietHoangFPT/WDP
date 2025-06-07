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
import { ITypeService } from './interfaces/itype.service'
import { CreateTypeDto } from './dto/createType.dto'
import { UpdateTypeDto } from './dto/updateType.dto'
import { TypeResponseDto } from './dto/typeResponse.dto'
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
@ApiTags('Types')
@Controller('types')
export class TypeController {
  constructor(
    @Inject(ITypeService)
    private readonly typeService: ITypeService, // Inject the service
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tao mới loại xét nghiệm' })
  @ApiResponse({
    status: 201,
    description: 'Loại xét nghiệm đã được tạo thành công',
    type: ApiResponseDto<TypeResponseDto>,
  })
  @ApiBody({ type: CreateTypeDto })
  async create(
    @Body() createTypeDto: CreateTypeDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<TypeResponseDto>> {
    const user = req.user.id
    const type = await this.typeService.create(createTypeDto, user)
    return new ApiResponseDto<TypeResponseDto>({
      statusCode: 201,
      message: 'Loại xét nghiệm đã được tạo thành công',
      data: [type],
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy tất cả loại xét nghiệm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách tất cả loại xét nghiệm',
    type: ApiResponseDto<TypeResponseDto[]>,
  })
  async findAll(): Promise<ApiResponseDto<TypeResponseDto[]>> {
    const types = await this.typeService.findAll()
    return new ApiResponseDto<TypeResponseDto[]>({
      statusCode: 200,
      message: 'Danh sách tất cả loại xét nghiệm',
      data: [types],
    })
  }

  @Get(':id')
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({ summary: 'Lấy loại xét nghiệm theo ID' })
  @ApiResponse({
    status: 200,
    description: 'Lấy loại xét nghiệm thành công',
    type: ApiResponseDto<TypeResponseDto>,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<TypeResponseDto>> {
    const type = await this.typeService.findById(id)
    return new ApiResponseDto<TypeResponseDto>({
      statusCode: 200,
      message: 'Lấy loại xét nghiệm thành công',
      data: [type],
    })
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật loại xét nghiệm theo ID' })
  @ApiBody({ type: UpdateTypeDto })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật loại xét nghiệm thành công',
    type: ApiResponseDto<TypeResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateTypeDto: UpdateTypeDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<TypeResponseDto>> {
    const user = req.user.id
    const updatedType = await this.typeService.update(id, updateTypeDto, user)
    return new ApiResponseDto<TypeResponseDto>({
      statusCode: 200,
      message: 'Cập nhật loại xét nghiệm thành công',
      data: [updatedType],
    })
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa loại xét nghiệm theo ID' })
  @ApiParam({ name: 'id', required: true })
  @ApiResponse({
    status: 204,
    description: 'Xóa loại xét nghiệm thành công',
  })
  async delete(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<null>> {
    const user = req.user.id
    await this.typeService.delete(id, user)
    return new ApiResponseDto<null>({
      statusCode: 204,
      message: 'Xóa loại xét nghiệm thành công',
      data: null,
    })
  }
}
