import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'

import { CreateResultDto } from './dto/createResult.dto'
import { UpdateResultDto } from './dto/updateResult.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IResultService } from './interfaces/iresult.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ResultDocument } from './schemas/result.schema'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
@ApiTags('results')
@Controller('results')
@ApiBearerAuth()
export class ResultController {
  constructor(
    @Inject(IResultService) private readonly resultService: IResultService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo kết quả mới' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiBody({
    type: CreateResultDto,
  })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(
    @Body() createResultDto: CreateResultDto,
    @Req() req: any, // Assuming req contains user info
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.create(createResultDto, req.user.id)
    return {
      data: [data],
      statusCode: 201,
      message: 'Tạo kết quả thành công',
      success: true,
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy kết quả theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Result ID' })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.findById(id)
    return {
      data: [data],
      statusCode: 200,
      message: 'Lấy kết quả thành công',
      success: true,
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Cập nhật kết quả theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Result ID' })
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.update(id, updateResultDto)
    return {
      data: [data],
      statusCode: 200,
      message: 'Cập nhật kết quả thành công',
      success: true,
    }
  }
}
