import { Get, Inject, Query, Controller, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'
import { IStaffService } from './interfaces/istaff.service'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
@ApiTags('staff')
@Controller('staff')
@ApiBearerAuth()
export class StaffController {
  constructor(
    @Inject(IStaffService) private readonly staffService: IStaffService,
  ) {}

  @Get('/service-cases')
  @UseGuards(AuthGuard, RolesGuard)
  // @Roles(RoleEnum.STAFF, RoleEnum.MANAGER, RoleEnum.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ theo email khách hàng' })
  @ApiResponse({
    status: 200,
    type: [ApiResponseDto<ServiceCaseResponseDto>],
    description: 'Danh sách hồ sơ dịch vụ theo email khách hàng',
  })
  @ApiQuery({ name: 'facilityId', required: true, type: String })
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiQuery({ name: 'currentStatus', required: false, type: String })
  async getServiceCasesByCustomerEmail(
    @Query('facilityId') facilityId: string,
    @Query('email') email: string,
    @Query('currentStatus') currentStatus: string,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const data = await this.staffService.getServiceCasesByCustomerEmail(
      facilityId,
      email,
      currentStatus,
    )
    return {
      data,
      success: true,
      message: 'Lấy danh sách hồ sơ thành công',
      statusCode: 200,
    }
  }
}
