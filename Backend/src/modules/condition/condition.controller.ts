import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuards,
  Req,
  Get,
  Put,
  Param,
  Delete,
  HttpStatus,
} from '@nestjs/common'
import { CreateConditionDto } from './dto/create-condition.dto'
import { IConditionService } from './interfaces/icondition.service'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { UpdateConditionDto } from './dto/update-condition.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'

@Controller('conditions')
export class ConditionController {
  constructor(
    @Inject(IConditionService)
    private readonly conditionService: IConditionService, // <-- Thay đổi cách inject
  ) {}

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateConditionDto })
  @ApiOperation({ summary: 'Tạo tình trạng mẫu thử mới' })
  create(@Body() createConditionDto: CreateConditionDto, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.conditionService.createCondition(user, createConditionDto)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả tình trạng của mẫu thử' })
  findAllConditions() {
    return this.conditionService.findAllConditions()
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Put(':id')
  @ApiBody({ type: UpdateConditionDto })
  @ApiOperation({ summary: 'Thay đổi tình trạng mẫu' })
  update(
    @Param('id') id: string,
    @Body() updateConditionDto: UpdateConditionDto,
    @Req() req: any,
  ) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.conditionService.updateCondition(id, user, updateConditionDto)
  }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa tình trạng mẫu' })
  async deleteCondition(@Param('id') id: string, @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    await this.conditionService.deleteCondition(id, user)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa tình trạng mẫu thử thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
