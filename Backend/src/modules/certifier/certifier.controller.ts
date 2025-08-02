import {
  Get,
  Controller,
  Inject,
  Param,
  UseGuards,
  Req,
  Query,
  Post,
  Body,
} from '@nestjs/common'
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger'
import { ICertifierService } from './interfaces/icertifier.service'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import { AdnDocumentationResponseDto } from '../adnDocumentation/dto/adnDocumentationResponse.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'
import { IResultService } from '../result/interfaces/iresult.service'
import { CreateResultDto } from '../result/dto/createResult.dto'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'

@ApiTags('certifiers')
@Controller('certifiers')
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.CERTIFIER)
@ApiBearerAuth()
export class CertifierController {
  constructor(
    @Inject(ICertifierService)
    private readonly certifierService: ICertifierService,
    @Inject(IResultService)
    private readonly resultService: IResultService,
  ) {}

  @Get('service-cases-without-result')
  @ApiQuery({
    name: 'currentStatus',
    required: true,
    description: 'Trạng thái hiện tại của hồ sơ dịch vụ',
  })
  @ApiQuery({
    name: 'resultExists',
    required: true,
    description: 'Kiểm tra xem kết quả đã tồn tại hay chưa',
  })
  @ApiOperation({ summary: 'Get service cases without result' })
  @ApiResponse({ status: 200, type: ServiceCaseResponseDto })
  async getServiceCasesWithoutResult(
    @Query('currentStatus') currentStatus: string,
    @Query('resultExists') resultExists: boolean,
  ): Promise<ApiResponseDto<ServiceCaseResponseDto>> {
    const data = await this.certifierService.getAllServiceCasesWithoutResult(
      currentStatus,
      resultExists,
    )
    return {
      data: data,
      success: true,
      message: 'Lấy danh sách hồ sơ dịch vụ thành công',
      statusCode: 200,
    }
  }

  @Get('test-request-statuses')
  @ApiOperation({
    summary: 'Lấy danh sách trạng thái yêu cầu xét nghiệm của người chứng nhận',
  })
  @ApiResponse({
    status: 200,
    type: ApiResponseDto<TestRequestStatusDocument>,
  })
  async getTestRequestStatuses(): Promise<
    ApiResponseDto<TestRequestStatusDocument>
  > {
    const statuses =
      await this.certifierService.getCertifierTestRequestStatuses()
    return {
      data: statuses,
      success: true,
      message: 'Lấy danh sách trạng thái yêu cầu xét nghiệm thành công',
      statusCode: 200,
    }
  }

  @Get('documentation/:serviceCaseId')
  @ApiOperation({
    summary: 'Lấy tài liệu ADN theo ID hồ sơ dịch vụ',
  })
  @ApiParam({
    name: 'serviceCaseId',
    required: true,
    description: 'ID của hồ sơ dịch vụ',
  })
  @ApiResponse({
    status: 200,
    type: AdnDocumentationResponseDto,
  })
  async getDocumentationByServiceCaseId(
    @Param('serviceCaseId') serviceCaseId: string,
  ): Promise<ApiResponseDto<AdnDocumentationResponseDto>> {
    const documentation =
      await this.certifierService.getDocumentationByServiceCaseId(serviceCaseId)
    return {
      data: [documentation],
      success: true,
      message: 'Lấy tài liệu ADN thành công',
      statusCode: 200,
    }
  }

  @Post('create-result')
  @ApiOperation({ summary: 'Tạo kết quả cho hồ sơ dịch vụ' })
  @ApiBody({
    description: 'Thông tin kết quả cần tạo',
    type: CreateResultDto,
  })
  async createResult(
    @Req() req: any,
    @Body() createResultDto: CreateResultDto,
  ) {
    const userId = req.user.id
    const result = await this.resultService.create(createResultDto, userId)
    return {
      data: result,
      success: true,
      message: 'Tạo kết quả cho hồ sơ dịch vụ thành công',
      statusCode: 201,
    }
  }
}
