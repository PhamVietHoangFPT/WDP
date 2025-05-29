import {
  Controller,
  Post,
  Body,
  Inject,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common'
import { CreateConditionDto } from './dto/create-condition.dto'
import { IConditionService } from './interfaces/icondition.service'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@Controller('conditions')
export class ConditionController {
  constructor(
    @Inject(IConditionService)
    private readonly conditionService: IConditionService, // <-- Thay đổi cách inject
  ) { }

  @UseGuards(AuthGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('bearer')
  @Post()
  @ApiBody({ type: CreateConditionDto })
  @ApiOperation({ summary: 'Tạo tình trạng mẫu thử mới' })
  create(
    @Body() createConditionDto: CreateConditionDto,
    @Req() req: any) {
    const user = req.user.id // Lấy thông tin người dùng từ request
    return this.conditionService.createCondition(user, createConditionDto)
  }

  @Get()
  @ApiOperation({ summary: 'Xem tất cả tình trạng của mẫu thử' })
  findAllConditions() {
    return this.conditionService.findAllConditions()
  }

  // @Post()
  //  @ApiOperation({ summary: 'Tạo người dùng mới' })
  //  @ApiBody({ type: CreateAccountDto })
  //  @ApiResponse({
  //    status: HttpStatus.CREATED,
  //    type: ApiResponseDto<AccountResponseDto>,
  //  })
  //  @HttpCode(HttpStatus.CREATED)
  //  async createAccount(
  //    @Body() createAccountDto: CreateAccountDto,
  //  ): Promise<ApiResponseDto<AccountResponseDto>> {
  //    const newAccountData: AccountResponseDto =
  //      await this.accountsService.createAccount(createAccountDto)
  //    return new ApiResponseDto<AccountResponseDto>({
  //      data: [newAccountData],
  //      success: true,
  //      message: 'Tài khoản được tạo thành công',
  //      statusCode: HttpStatus.CREATED,
  //    })
  //  }

  // @Get()
  // findAll() {
  //   return this.ConditionService.findAll();
  // }

  //   @Get(':id')
  //   findOne(@Param('id') id: string) {
  //     return this.ConditionService.findOne(id);
  //   }

  //   @Patch(':id')
  //   update(@Param('id') id: string, @Body() updateUserDto: UpdateConditionDto) {
  //     return this.ConditionService.update(+id, updateUserDto);
  //   }

  //   @Delete(':id')
  //   remove(@Param('id') id: string) {
  //     return this.ConditionService.remove(+id);
  //   }
}
