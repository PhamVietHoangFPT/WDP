import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger'

import { CreateResultDto } from '../result/dto/createResult.dto'
import { UpdateResultDto } from '../result/dto/updateResult.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IResultService } from '../result/interfaces/iresult.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ResultDocument } from '../result/schemas/result.schema'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { IDoctorService } from './interfaces/idoctor.service'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { TestRequestStatus } from '../testRequestStatus/schemas/testRequestStatus.schema'
import { IServiceCaseService } from '../serviceCase/interfaces/iserviceCase.service'
@ApiTags('doctors')
@Controller('doctors')
@ApiBearerAuth()
export class DoctorController {
  constructor(
    @Inject(IResultService) private readonly resultService: IResultService,
    @Inject(IServiceCaseService) private readonly serviceCaseService: IServiceCaseService,
    @Inject(IDoctorService)
    private readonly doctorService: IDoctorService,
  ) { }

  @Patch('/serviceCase/:id/condition/:condition')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cập nhật condition của hồ sơ dịch vụ' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'ID của hồ sơ dịch vụ cần cập nhật',
  })
  @ApiParam({
    name: 'condition',
    required: true,
    type: String,
    description: 'Condition mới của hồ sơ dịch vụ',
  })
  @ApiResponse({ status: 200, type: ApiResponseDto<ServiceCaseResponseDto> })
  async updateCondition(
    @Param('id') id: string,
    @Param('condition') condition: string,
    @Req() req: any,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto> | null> {
    const doctorId = req.user.id
    const updatedServiceCase =
      await this.serviceCaseService.updateCondition(
        id,
        condition,
        doctorId
      )
    if (!updatedServiceCase) {
      return null
    }
    return {
      message: 'Cập nhật trạng thái hiện tại thành công',
      data: [updatedServiceCase],
      statusCode: 200,
      success: true,
    }
  }

  @Post('/results')
  @ApiOperation({ summary: 'Tạo kết quả mới' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiBody({
    type: CreateResultDto,
  })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(
    @Body() createResultDto: CreateResultDto,
    @Req() req: any, // Assuming req contains user info
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.create(createResultDto, req.user.id)
    return {
      data: [data],
      statusCode: 201,
      message: 'Tạo kết quả thành công',
      success: true,
    }
  }

  @Get('/results/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy kết quả theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Result ID' })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.findById(id)
    return {
      data: [data],
      statusCode: 200,
      message: 'Lấy kết quả thành công',
      success: true,
    }
  }

  @Put('/results/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Cập nhật kết quả theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'Result ID' })
  async update(
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
  ): Promise<ApiResponseDto<ResultDocument>> {
    const data = await this.resultService.update(id, updateResultDto)
    return {
      data: [data],
      statusCode: 200,
      message: 'Cập nhật kết quả thành công',
      success: true,
    }
  }

  @Get('/service-cases-without-results')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ dịch vụ chưa trả kết quả' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'currentStatus',
    required: true,
    type: String,
    description: 'Trạng thái hiện tại của hồ sơ dịch vụ',
  })
  @ApiQuery({
    name: 'resultExists',
    required: true,
    type: Boolean,
    description: 'Chỉ lấy hồ sơ dịch vụ chưa có kết quả (true/false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách hồ sơ dịch vụ đã trả kết quả',
    type: ApiResponseDto,
    isArray: true,
  })
  async getAllServiceCasesWithoutResults(
    @Req() req: any, // Assuming req contains user info
    @Query('currentStatus') currentStatus: string,
    @Query('resultExists') resultExists: boolean, // Default to false if not provided
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const facilityId = req.user.facility._id
    const doctorId = req.user.id // Assuming the user is a doctor
    const data = await this.doctorService.getAllServiceCasesWithoutResults(
      facilityId,
      doctorId,
      currentStatus,
      resultExists,
    )
    return {
      data: data,
      statusCode: 200,
      message: 'Lấy danh sách hồ sơ dịch vụ chưa trả kết quả thành công',
      success: true,
    }
  }

  @Get('/test-request-statuses')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({
    summary: 'Lấy danh sách trạng thái yêu cầu xét nghiệm của bác sĩ',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Danh sách trạng thái yêu cầu xét nghiệm',
    type: ApiResponseDto<TestRequestStatus[]>,
  })
  async getDoctorTestRequestStatuses(): Promise<
    ApiResponseDto<TestRequestStatus>
  > {
    const data = await this.doctorService.getDoctorTestRequestStatuses()
    return {
      data: data,
      statusCode: 200,
      message: 'Lấy danh sách trạng thái yêu cầu xét nghiệm thành công',
      success: true,
    }
  }
}
