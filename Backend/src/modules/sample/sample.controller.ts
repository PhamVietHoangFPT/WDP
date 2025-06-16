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
  Req,
  UseGuards,
} from '@nestjs/common'
import { ISampleService } from './interfaces/isample.service'

import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { CreateSampleDto } from './dto/create-sample.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { UpdateSampleDto } from './dto/update-sample.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { SampleResponseDto } from './dto/sample-response.dto'

@ApiTags('Samples')
@Controller('samples')
export class SampleController {
  constructor(
    @Inject(ISampleService)
    private readonly sampleService: ISampleService, // <-- Thay đổi cách inject
  ) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateSampleDto })
  @ApiOperation({ summary: 'Tạo loại mẫu thử mới' })
  create(@Body() createConditionDto: CreateSampleDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.sampleService.createSample(user, createConditionDto)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả loại của mẫu thử' })
  @ApiResponse({ status: HttpStatus.OK, type: [SampleResponseDto] })
  async findAllConditions(): Promise<ApiResponseDto<SampleResponseDto>> {
    const result = await this.sampleService.findAllSample()
    return new ApiResponseDto<SampleResponseDto>({
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách loại mẫu thử thành công',
      data: result,
    })
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Put(':id')
  @ApiBody({ type: UpdateSampleDto })
  @ApiOperation({ summary: 'Thay đổi thông tin loại mẫu thử' })
  @ApiResponse({ status: HttpStatus.OK, type: SampleResponseDto })
  update(
    @Param('id') id: string,
    @Body() updateSampleDto: UpdateSampleDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.sampleService.updateSample(id, user, updateSampleDto)
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa loại mẫu thử' })
  async delete(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.sampleService.deleteSample(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa loại mẫu thử thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
