import {
  Body,
  Controller,
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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { CreateCaseMemberDto } from './dto/createCaseMember.dto'
import { UpdateCaseMemberDto } from './dto/updateCaseMember.dto'
import { CaseMemberResponseDto } from './dto/caseMemberResponse.dto'
import { ICaseMemberService } from './interfaces/icaseMember.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('case-members')
@Controller('case-members')
@UseGuards(AuthGuard, RolesGuard)
export class CaseMemberController {
  constructor(
    @Inject(ICaseMemberService)
    private readonly caseMemberService: ICaseMemberService,
  ) { }

  @Get()
  @ApiBearerAuth()
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ nhóm người cần xét nghiệm' })
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
    type: PaginatedResponseDto<CaseMemberResponseDto>,
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
    @Req() req: any,
  ) {
    const { pageNumber, pageSize } = paginationQuery
    const userId = req.user.id
    const userRole = req.user.role
    if (userRole === RoleEnum.STAFF) {
      // Nếu là STAFF, không cần truyền userId
      return this.caseMemberService.findAllCaseMembers(pageNumber, pageSize)
    }
    return this.caseMemberService.findAllCaseMembers(
      pageNumber,
      pageSize,
      userId,
    )
  }

  @Post()
  @ApiBearerAuth()
  @Roles(RoleEnum.CUSTOMER)
  @ApiOperation({ summary: 'Tạo hồ sơ nhóm người cần xét nghiệm' })
  @ApiResponse({
    status: 201,
    description: 'Hồ sơ nhóm người cần xét nghiệm đã được tạo thành công',
    type: CaseMemberResponseDto,
  })
  async create(
    @Body() createCaseMemberDto: CreateCaseMemberDto,
    @Req() req: any,
  ): Promise<CaseMemberResponseDto> {
    const userId = req.user.id
    const caseMember = await this.caseMemberService.create(
      createCaseMemberDto,
      userId,
    )
    return caseMember
  }

  @Get(':id')
  @ApiBearerAuth()
  // @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Lấy thông tin hồ sơ nhóm người cần xét nghiệm theo ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin hồ sơ nhóm người cần xét nghiệm',
    type: ApiResponseDto<CaseMemberResponseDto>,
  })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<CaseMemberResponseDto>> {
    const caseMember = await this.caseMemberService.findById(id)
    return {
      data: [caseMember],
      message: 'Lấy thông tin hồ sơ nhóm người cần xét nghiệm thành công',
      statusCode: HttpStatus.OK,
      success: true,
    }
  }

  @Put(':id')
  @ApiBearerAuth()
  @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Cập nhật hồ sơ nhóm người cần xét nghiệm',
  })
  @ApiOperation({
    summary: 'Cập nhật hồ sơ nhóm người cần xét nghiệm',
  })
  @ApiResponse({
    status: 200,
    description: 'Hồ sơ nhóm người cần xét nghiệm đã được cập nhật thành công',
    type: ApiResponseDto<CaseMemberResponseDto>,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCaseMemberDto: UpdateCaseMemberDto,
    @Req() req: any,
  ): Promise<ApiResponseDto<CaseMemberResponseDto>> {
    const userId = req.user.id
    const caseMember = await this.caseMemberService.update(
      id,
      updateCaseMemberDto,
      userId,
    )
    return new ApiResponseDto<CaseMemberResponseDto>({
      data: [caseMember],
      message: 'Cập nhật hồ sơ nhóm người cần xét nghiệm thành công',
      statusCode: HttpStatus.OK,
      success: true,
    })
  }

  // @Put(':id/add-member')
  // @ApiBearerAuth()
  // @Roles(RoleEnum.CUSTOMER, RoleEnum.STAFF)
  // @ApiParam({
  //   name: 'id',
  //   required: true,
  //   description: 'Thêm thành viên vào hồ sơ nhóm người cần xét nghiệm',
  // })
  // @ApiOperation({
  //   summary: 'Thêm thành viên vào hồ sơ nhóm người cần xét nghiệm',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Thành viên đã được thêm vào hồ sơ nhóm người cần xét nghiệm',
  //   type: ApiResponseDto<CaseMemberResponseDto>,
  // })
  // async addMember(
  //   @Param('id') caseMemberId: string,
  //   @Body('testTakerId') testTakerId: string,
  //   @Req() req: any,
  // ): Promise<ApiResponseDto<CaseMemberResponseDto>> {
  //   const userId = req.user.id
  //   const caseMember = await this.caseMemberService.addMember(
  //     caseMemberId,
  //     testTakerId,
  //     userId,
  //   )
  //   return {
  //     data: [caseMember],
  //     message: 'Thêm thành viên vào hồ sơ nhóm người cần xét nghiệm thành công',
  //     statusCode: HttpStatus.OK,
  //     success: true,
  //   }
  // }
}
