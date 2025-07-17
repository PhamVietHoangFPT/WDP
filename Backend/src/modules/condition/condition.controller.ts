import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { IConditionService } from './interfaces/icondition.service'
import { ConditionResponseDto } from './dto/conditionResponse.dto'
import { RolesGuard } from 'src/common/guard/roles.guard'

@ApiTags('condition')
@Controller('condition')
export class ConditionController {
  constructor(
    @Inject(IConditionService)
    private readonly ConditionService: IConditionService, // <-- Thay đổi cách inject
  ) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem tất cả condition' })
  @ApiResponse({ status: HttpStatus.OK, type: [ConditionResponseDto] })
  async findAll() {
    const result = await this.ConditionService.findAllCondition()
    return result
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm condition' })
  @ApiResponse({ status: HttpStatus.OK, type: ConditionResponseDto })
  async findById(@Param('id') id: string): Promise<ConditionResponseDto> {
    return await this.ConditionService.findConditionById(id)
  }
}
