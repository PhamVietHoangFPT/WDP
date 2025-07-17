import { Get, Controller, Inject, Req, UseGuards, Query } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger'

import { ISampleCollectorService } from './interfaces/isampleCollector.service'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { ServiceCaseDocument } from '../serviceCase/schemas/serviceCase.schema'
import { TestRequestStatusDocument } from '../testRequestStatus/schemas/testRequestStatus.schema'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { FacilityAccessGuard } from 'src/common/guard/facility.guard'

@ApiTags('sample-collector')
@Controller('sample-collector')
@UseGuards(AuthGuard, RolesGuard, FacilityAccessGuard)
export class SampleCollectorController {
  constructor(
    @Inject(ISampleCollectorService)
    private readonly sampleCollectorService: ISampleCollectorService,
  ) {}

  @Get('service-cases')
  @ApiBearerAuth('bearer')
  @Roles(RoleEnum.SAMPLE_COLLECTOR)
  @ApiOperation({
    summary: 'Lấy tất cả trường hợp dịch vụ cho nhân viên lấy mẫu',
  })
  @ApiQuery({
    name: 'serviceCaseStatus',
    required: true,
    description: 'Trạng thái của trường hợp dịch vụ',
    type: String,
  })
  @ApiQuery({
    name: 'isAtHome',
    required: true,
    description: 'Lọc theo trường hợp dịch vụ tại nhà',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tất cả trường hợp dịch vụ thành công',
    type: ApiResponseDto<ServiceCaseDocument>,
  })
  async getAllServiceCaseForSampleCollector(
    @Query('serviceCaseStatus') serviceCaseStatus: string,
    @Query('isAtHome') isAtHome: boolean,
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseDocument>> {
    const sampleCollectorId = req.user.id
    const data =
      await this.sampleCollectorService.getAllServiceCaseForSampleCollector(
        sampleCollectorId,
        serviceCaseStatus,
        isAtHome,
      )
    return new ApiResponseDto<ServiceCaseDocument>({
      data,
      success: true,
      statusCode: 200,
      message: 'Lấy tất cả trường hợp dịch vụ thành công',
    })
  }

  @Get('service-case-status')
  @ApiBearerAuth('bearer')
  @Roles(RoleEnum.SAMPLE_COLLECTOR)
  @ApiOperation({
    summary: 'Lấy tất cả trạng thái trường hợp dịch vụ cho nhân viên lấy mẫu',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy tất cả trạng thái trường hợp dịch vụ thành công',
    type: ApiResponseDto<TestRequestStatusDocument>,
  })
  async getAllServiceCaseStatusForSampleCollector(): Promise<
    ApiResponseDto<TestRequestStatusDocument>
  > {
    const data =
      await this.sampleCollectorService.getAllServiceCaseStatusForSampleCollector()
    return new ApiResponseDto<TestRequestStatusDocument>({
      data,
      statusCode: 200,
      message: 'Lấy tất cả trạng thái trường hợp dịch vụ thành công',
      success: true,
    })
  }
}
