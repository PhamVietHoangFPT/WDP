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

  @Get('service-cases-without-sample-collector')
  @ApiBearerAuth()
  @Roles(RoleEnum.MANAGER)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ chưa có nhân viên lấy mẫu' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách hồ sơ chưa có nhân viên lấy mẫu',
    type: ServiceCaseResponseDto,
    isArray: true,
  })
  async getAllServiceCasesWithoutSampleCollector(
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const facilityId = req.user.facility._id
    const data =
      await this.managerService.getAllServiceCasesWithoutSampleCollector(
        facilityId,
      )
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Danh sách hồ sơ chưa có nhân viên lấy mẫu',
      data: data.map((item) => new ServiceCaseResponseDto(item)),
    }
  }
}
