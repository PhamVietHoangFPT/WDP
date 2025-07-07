import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'

import { IManagerService } from './interfaces/imanager.service'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { AuthGuard } from '../../common/guard/auth.guard'
import { ApiResponseDto } from '../../common/dto/api-response.dto'
import { RolesGuard } from '../../common/guard/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { RoleEnum } from '../../common/enums/role.enum'
import { FacilityAccessGuard } from 'src/common/guard/facility.guard'
import { RoleDocument } from '../role/schemas/role.schema'
import { ManagerCreateAccountDto } from './dto/managerCreateAccount.dto'

@ApiTags('managers')
@Controller('managers')
@UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
export class ManagerController {
  constructor(
    @Inject(IManagerService)
    private readonly managerService: IManagerService,
  ) {}

  @Get('sample-collectors')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách nhân viên lấy mẫu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách nhân viên lấy mẫu',
    type: AccountResponseDto,
    isArray: true,
  })
  async getAllSampleCollectors(
    @Req() req: any,
  ): Promise<ApiResponseDto<AccountResponseDto>> {
    const facilityId = req.user.facility._id
    const data = await this.managerService.getAllSampleCollectors(facilityId)
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách nhân viên lấy mẫu',
      data: data.map((item) => new AccountResponseDto(item)),
    }
  }

  @Get('service-cases-without-sample-collector/:isAtHome')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ chưa có nhân viên lấy mẫu' })
  @ApiParam({
    name: 'isAtHome',
    description: 'Lọc hồ sơ tại nhà (true) hoặc tại cơ sở (false)',
    required: false,
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách hồ sơ chưa có nhân viên lấy mẫu',
    type: ServiceCaseResponseDto,
    isArray: true,
  })
  async getAllServiceCasesWithoutSampleCollector(
    @Req() req: any,
    @Param('isAtHome') isAtHome: boolean = true, // Default to true if not provided
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const facilityId = req.user.facility._id
    const data =
      await this.managerService.getAllServiceCasesWithoutSampleCollector(
        facilityId,
        isAtHome,
      )
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách hồ sơ chưa có nhân viên lấy mẫu',
      data: data.map((item) => new ServiceCaseResponseDto(item)),
    }
  }

  @Put('service-cases/:serviceCaseId/sample-collector/:sampleCollectorId')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({
    summary: 'Gán nhân viên lấy mẫu cho hồ sơ dịch vụ',
  })
  @ApiParam({
    name: 'serviceCaseId',
    description: 'ID của hồ sơ dịch vụ',
    required: true,
  })
  @ApiParam({
    name: 'sampleCollectorId',
    description: 'ID của nhân viên lấy mẫu',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
    type: ApiResponseDto,
  })
  async assignSampleCollectorToServiceCase(
    @Param('serviceCaseId') serviceCaseId: string,
    @Param('sampleCollectorId') sampleCollectorId: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const userId = req.user.id
    const data = await this.managerService.assignSampleCollectorToServiceCase(
      serviceCaseId,
      sampleCollectorId,
      userId,
    )
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Cập nhật thành công',
      data: [data],
    }
  }

  @Get('roles')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Quản lý lấy danh sách vai trò' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách vai trò',
    type: ApiResponseDto<RoleDocument[]>,
    isArray: true,
  })
  async getAllRoles(): Promise<ApiResponseDto<RoleDocument>> {
    const data = await this.managerService.managerGetAllRoles()
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách vai trò',
      data: data,
    }
  }

  @Post('create-account')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Tạo tài khoản mới' })
  @ApiBody({
    description: 'Thông tin tài khoản mới',
    type: ManagerCreateAccountDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tạo tài khoản thành công',
    type: ApiResponseDto<ManagerCreateAccountDto>,
  })
  async createAccount(
    @Body() accountData: Partial<ManagerCreateAccountDto>,
    @Req() req: any, // Lấy thông tin người dùng từ request
  ): Promise<ApiResponseDto<ManagerCreateAccountDto>> {
    const userId = req.user.id
    const facilityId = req.user.facility._id
    const data = await this.managerService.managerCreateAccount(
      accountData,
      userId,
      facilityId,
    )
    return {
      statusCode: HttpStatus.CREATED,
      success: true,
      message: 'Tạo tài khoản thành công',
      data: [data],
    }
  }

  @Get('service-cases-without-doctor')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ dịch vụ chưa có bác sĩ' })
  async getAllServiceCaseWithoutDoctor(
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const facilityId = req.user.facility._id
    const data =
      await this.managerService.getAllServiceCaseWithoutDoctor(facilityId)
    return {
      data: data.map((item) => new ServiceCaseResponseDto(item)),
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách hồ sơ dịch vụ chưa có bác sĩ',
    }
  }

  @Put('service-cases/:serviceCaseId/doctor/:doctorId')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({
    summary: 'Gán bác sĩ cho hồ sơ dịch vụ',
  })
  @ApiParam({
    name: 'serviceCaseId',
    description: 'ID của hồ sơ dịch vụ',
    required: true,
  })
  @ApiParam({
    name: 'doctorId',
    description: 'ID của bác sĩ',
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
    type: ApiResponseDto<ServiceCaseResponseDto>,
  })
  async assignDoctorToServiceCase(
    @Param('serviceCaseId') serviceCaseId: string,
    @Param('doctorId') doctorId: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const userId = req.user.id
    const data = await this.managerService.assignDoctorToServiceCase(
      serviceCaseId,
      doctorId,
      userId,
    )
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Cập nhật thành công',
      data: [data],
    }
  }

  @Get('doctors')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách bác sĩ' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách bác sĩ',
    type: AccountResponseDto,
    isArray: true,
  })
  async getAllDoctors(
    @Req() req: any,
  ): Promise<ApiResponseDto<AccountResponseDto>> {
    const facilityId = req.user.facility._id
    const data = await this.managerService.getAllDoctors(facilityId)
    return {
      data: data.map((item) => new AccountResponseDto(item)),
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách bác sĩ',
    }
  }
}
