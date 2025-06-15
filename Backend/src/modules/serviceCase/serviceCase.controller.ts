import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  // ApiQuery,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IServiceCaseService } from './interfaces/iserviceCase.service'
import { ServiceCaseResponseDto } from './dto/serviceCaseResponse.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import {} from '@nestjs/common'
// import { PaginatedResponseDto } from 'src/common/dto/paginated-response.dto'
// import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto'

@ApiTags('serviceCases')
@Controller('serviceCases')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ServiceCaseController {
  constructor(
    @Inject(IServiceCaseService)
    private readonly serviceCaseService: IServiceCaseService,
  ) {}
  @Post()
  @ApiOperation({ summary: 'Create a new service case' })
  @ApiResponse({ status: 201, type: ApiResponseDto })
  create(
    @Body() createServiceCaseDto: CreateServiceCaseDto,
    @Req() req: any,
  ): Promise<ServiceCaseResponseDto> {
    const userId = req.user.id
    return this.serviceCaseService.createServiceCase(
      createServiceCaseDto,
      userId,
    )
  }
}
