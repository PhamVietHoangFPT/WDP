import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  // Put,
  HttpCode,
  HttpStatus,
  Inject, // <-- Thêm Inject
  Query,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger'

import { IAccountsService } from './interfaces/iaccount.service'
import { CreateAccountDto } from './dto/createAccount.dto'
import { AccountResponseDto } from './dto/accountResponse.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  // Inject Service bằng Interface Token
  constructor(
    @Inject(IAccountsService)
    private readonly accountsService: IAccountsService, // <-- Thay đổi cách inject
  ) {}

  // Các phương thức xử lý route giữ nguyên, chúng chỉ gọi AccountsService đã inject

  @Post()
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<AccountResponseDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body() createAccountDto: CreateAccountDto,
  ): Promise<ApiResponseDto<AccountResponseDto>> {
    const newAccountData: AccountResponseDto =
      await this.accountsService.createAccount(createAccountDto)
    return new ApiResponseDto<AccountResponseDto>({
      data: [newAccountData],
      success: true,
      message: 'Tài khoản được tạo thành công',
      statusCode: HttpStatus.CREATED,
    })
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách người dùng' })
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
  @ApiResponse({
    status: 200,
    description: 'Danh sách tài khoản.',
    type: PaginatedResponseDto<AccountResponseDto>,
  })
  async findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<AccountResponseDto>> {
    const { pageNumber, pageSize } = paginationQuery

    const accounts = await this.accountsService.findAllAccounts(
      pageNumber || 1,
      pageSize || 10,
    )

    return {
      ...accounts,
      data: accounts.data.map(
        (account) =>
          new AccountResponseDto({
            ...account,
          }),
      ),
      success: true,
      message: 'Lấy danh sách tài khoản thành công',
      statusCode: HttpStatus.OK,
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin người dùng theo ID',
  })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<AccountResponseDto>,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async findOne(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<AccountResponseDto>> {
    const dataAccount = await this.accountsService.findAccountById(id)
    return {
      data: [dataAccount],
      message: 'Lấy thông tin tài khoản thành công',
      success: true,
      statusCode: HttpStatus.OK,
    }
  }

  // @Put(':id')
  // @ApiOperation({ summary: 'Cập nhật thông tin người dùng (With Interface)' })
  // @ApiParam({ name: 'id', type: String })
  // @ApiBody({ type: UpdateUserDto })
  // @ApiResponse({ status: HttpStatus.OK, type: AccountResponseDto })
  // @ApiResponse({ status: HttpStatus.NOT_FOUND })
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  // ): Promise<AccountResponseDto> {
  //   return this.AccountsService.updateUser(id, updateUserDto);
  // }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Xóa tài khoản thành công.',
  }) // Giữ lại cái này
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy tài khoản.',
  }) // Giữ lại cái này
  // Xóa @ApiResponse({ type: AccountResponseDto })
  @HttpCode(HttpStatus.NO_CONTENT) // Giữ lại cái này để đảm bảo trả về 204
  async remove(@Param('id') id: string): Promise<void> {
    // <-- Sửa Promise<void>
    await this.accountsService.deleteAccount(id) // Chỉ cần gọi service
    // Không cần return gì cả, hoặc return;
  }
}
