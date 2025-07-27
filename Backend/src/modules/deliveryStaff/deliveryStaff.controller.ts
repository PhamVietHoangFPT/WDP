import { Controller, Get, Inject, Query, Req, UseGuards } from '@nestjs/common'

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger'

import { ApiResponseDto } from 'src/common/dto/api-response.dto'

import { IDeliveryStaffService } from './interfaces/ideliveryStaff.service'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'

@Controller('delivery-staff')
@ApiTags('delivery-staff')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DeliveryStaffController {
  constructor(
    @Inject(IDeliveryStaffService)
    private readonly deliveryStaffService: IDeliveryStaffService,
  ) {}

  @Get('/service-cases')
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ dịch vụ' })
  @ApiQuery({
    name: 'currentStatus',
    required: true,
    type: String,
    description: 'Trạng thái hiện tại của hồ sơ dịch vụ',
  })
  @ApiResponse({
    status: 200,
    description:
      'Danh sách hồ sơ dịch vụ được liên kết với nhân viên giao hàng',
    type: ApiResponseDto<ServiceCaseResponseDto>,
  })
  async getAllServiceCases(
    @Query('currentStatus') currentStatus: string,
    @Req() req: any, // Assuming req contains user info
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const deliveryStaffId = req.user.id
    const facilityId = req.user.facility._id
    const serviceCases =
      await this.deliveryStaffService.findAllServiceCasesByDeliveryStaffId(
        deliveryStaffId,
        currentStatus,
        facilityId,
      )
    return new ApiResponseDto<ServiceCaseResponseDto>({
      data: serviceCases,
      success: true,
      message: 'Lấy danh sách hồ sơ dịch vụ thành công',
      statusCode: 200,
    })
  }

  @Get('/service-case-statuses')
  @ApiOperation({
    summary:
      'Lấy danh sách trạng thái yêu cầu xét nghiệm của nhân viên giao hàng',
  })
  async getAllTestRequestStatuses(): Promise<ApiResponseDto<any>> {
    const testRequestStatuses =
      await this.deliveryStaffService.getDeliveryStaffTestRequestStatuses()
    return new ApiResponseDto<any>({
      data: testRequestStatuses,
      success: true,
      message: 'Lấy danh sách trạng thái yêu cầu xét nghiệm thành công',
      statusCode: 200,
    })
  }
}
