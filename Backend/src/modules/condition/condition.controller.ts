import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, HttpStatus, HttpCode } from '@nestjs/common';
import { CreateConditionDto } from './dto/create-condition.dto';
import { IConditionService } from './interfaces/icondition.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';
import { ConditionResponseDto } from './dto/condition-response.dto';



@Controller('conditions')
export class ConditionController {

  constructor(
    @Inject(IConditionService)
    private readonly conditionService: IConditionService, // <-- Thay đổi cách inject
  ) { }

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiBody({ type: CreateConditionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<ConditionResponseDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async createCondition(
    @Body() createConditionDto: CreateConditionDto)
    : Promise<ApiResponseDto<ConditionResponseDto>> {
    const newConditionData =
      await this.conditionService.createCondition(createConditionDto)
    return {
      data: [newConditionData],
      success: true,
      message: 'Tài khoản được tạo thành công',
      statusCode: HttpStatus.CREATED,
    }
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
