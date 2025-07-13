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
import { ITimeReturnService } from './interfaces/itimeReturn.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RoleEnum } from 'src/common/enums/role.enum'
import { Roles } from 'src/common/decorators/roles.decorator'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateTimeReturnDto } from './dto/createTimeReturn.dto'
import { UpdateTimeReturnDto } from './dto/updateTimeReturn.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { TimeReturnResponseDto } from './dto/timeReturn.response.dto'

@ApiTags('time-return')
@Controller('time-return')
export class TimeReturnController {
  constructor(
    @Inject(ITimeReturnService)
    private readonly timeReturnService: ITimeReturnService, // <-- Thay đổi cách inject
  ) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateTimeReturnDto })
  @ApiOperation({ summary: 'Tạo tình ngày trả mẫu thử mới' })
  create(@Body() createTimeReturnDto: CreateTimeReturnDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.timeReturnService.createTimeReturn(user, createTimeReturnDto)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả ngày trả của mẫu thử' })
  async findAllConditions() {
    const timeReturns = await this.timeReturnService.findAllTimeReturn()
    return new ApiResponseDto<TimeReturnResponseDto>({
      data: timeReturns,
      success: true,
      message: 'Lấy danh sách ngày trả mẫu thử thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Put(':id')
  @ApiBody({ type: UpdateTimeReturnDto })
  @ApiOperation({ summary: 'Thay đổi thông tin ngày trả mẫu thử' })
  update(
    @Param('id') id: string,
    @Body() updateTimeReturnDto: UpdateTimeReturnDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.timeReturnService.updateTimeReturn(
      id,
      user,
      updateTimeReturnDto,
    )
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ngày trả mẫu thử' })
  async deleteCondition(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.timeReturnService.deleteTimeReturn(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa ngày trả mẫu thử thành công',
      statusCode: HttpStatus.OK,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin ngày trả mẫu thử theo ID' })
  async findById(@Param('id') id: string) {
    const timeReturn = await this.timeReturnService.findById(id)
    return new ApiResponseDto<TimeReturnResponseDto>({
      success: true,
      message: 'Lấy thông tin ngày trả mẫu thử thành công',
      data: [timeReturn],
      statusCode: HttpStatus.OK,
    })
  }
}
