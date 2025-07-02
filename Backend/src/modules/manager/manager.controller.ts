import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
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
}
