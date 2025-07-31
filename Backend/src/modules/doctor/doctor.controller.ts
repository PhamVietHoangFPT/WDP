import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
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

import { CreateAdnDocumentationDto } from '../adnDocumentation/dto/createAdnDocumentation.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IAdnDocumentationService } from '../adnDocumentation/interfaces/iadnDocumentation.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { IDoctorService } from './interfaces/idoctor.service'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { TestRequestStatus } from '../testRequestStatus/schemas/testRequestStatus.schema'
import { IServiceCaseService } from '../serviceCase/interfaces/iserviceCase.service'
import { AdnDocumentationResponseDto } from '../adnDocumentation/dto/adnDocumentationResponse.dto'
@ApiTags('doctors')
@Controller('doctors')
@ApiBearerAuth()
export class DoctorController {
  constructor(
    @Inject(IServiceCaseService)
    private readonly serviceCaseService: IServiceCaseService,
    @Inject(IDoctorService)
    private readonly doctorService: IDoctorService,
    @Inject(IAdnDocumentationService)
    private readonly adnDocumentationService: IAdnDocumentationService,
  ) {}

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
    const updatedServiceCase = await this.serviceCaseService.updateCondition(
      id,
      condition,
      doctorId,
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

  @Post('/adn-documentation')
  @ApiOperation({ summary: 'Tạo tài liệu ADN mới' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiBody({
    type: CreateAdnDocumentationDto,
  })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  async create(
    @Body() createAdnDocumentationDto: CreateAdnDocumentationDto,
    @Req() req: any, // Assuming req contains user info
  ): Promise<ApiResponseDto<AdnDocumentationResponseDto>> {
    const data = await this.adnDocumentationService.create(
      createAdnDocumentationDto,
      req.user.id,
    )
    return {
      data: [data],
      statusCode: 201,
      message: 'Tạo tài liệu ADN thành công',
      success: true,
    }
  }

  @Get('/adn-documentation/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy tài liệu ADN theo ID' })
  @ApiParam({ name: 'id', type: String, description: 'ADN Document ID' })
  async findById(
    @Param('id') id: string,
  ): Promise<ApiResponseDto<AdnDocumentationResponseDto>> {
    const data = await this.adnDocumentationService.findById(id)
    return {
      data: [data],
      statusCode: 200,
      message: 'Lấy tài liệu ADN thành công',
      success: true,
    }
  }

  @Get('/adn-documentation/service-case/:serviceCaseId')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy tài liệu ADN theo ID hồ sơ dịch vụ' })
  @ApiParam({
    name: 'serviceCaseId',
    type: String,
    description: 'ID của hồ sơ dịch vụ',
  })
  async findByServiceCaseId(
    @Param('serviceCaseId') serviceCaseId: string,
  ): Promise<ApiResponseDto<AdnDocumentationResponseDto[]>> {
    const data =
      await this.adnDocumentationService.findByServiceCaseId(serviceCaseId)
    return {
      data: [data],
      statusCode: 200,
      message: 'Lấy tài liệu ADN theo ID hồ sơ dịch vụ thành công',
      success: true,
    }
  }

  @Get('/service-cases-without-adn-documentation')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleEnum.DOCTOR)
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ dịch vụ chưa có tài liệu ADN' })
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
    description: 'Chỉ lấy hồ sơ dịch vụ chưa có tài liệu ADN (true/false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách hồ sơ dịch vụ đã có tài liệu ADN',
    type: ApiResponseDto,
    isArray: true,
  })
  async getAllServiceCasesWithoutAdnDocumentation(
    @Req() req: any, // Assuming req contains user info
    @Query('currentStatus') currentStatus: string,
    @Query('resultExists') resultExists: boolean, // Default to false if not provided
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const facilityId = req.user.facility._id
    const doctorId = req.user.id // Assuming the user is a doctor
    const data =
      await this.doctorService.getAllServiceCasesWithoutAdnDocumentation(
        facilityId,
        doctorId,
        currentStatus,
        resultExists,
      )
    return {
      data: data,
      statusCode: 200,
      message: 'Lấy danh sách hồ sơ dịch vụ chưa có tài liệu ADN thành công',
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
