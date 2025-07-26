import {
  Get,
  Controller,
  Inject,
  Query,
  BadRequestException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common'
import { IDashboardService } from './interfaces/idashboard.service'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
import { AuthGuard } from 'src/common/guard/auth.guard'

@Controller('dashboard')
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(RoleEnum.ADMIN, RoleEnum.MANAGER)
export class DashboardController {
  constructor(
    @Inject(IDashboardService)
    private readonly dashboardService: IDashboardService,
  ) {}

  @Get('by-date') // Đổi tên route cho rõ ràng
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard cho một ngày cụ thể' })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Ngày cần xem (YYYY-MM-DD). Mặc định là hôm nay.',
  })
  @ApiQuery({ name: 'facilityId', required: false, type: String })
  async getDashboardDataByDate(
    @Query('date') dateString?: string,
    @Query('facilityId') facilityId?: string,
  ): Promise<ApiResponseDto<any>> {
    // Dùng một biến để lưu ngày cần xử lý
    const targetDate = dateString ? new Date(dateString) : new Date()

    // Kiểm tra xem date có hợp lệ không
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException(
        'Định dạng ngày không hợp lệ. Vui lòng dùng YYY-MM-DD.',
      )
    }

    // ✅ TÍNH TOÁN NGÀY BẮT ĐẦU VÀ KẾT THÚC THEO CHUẨN UTC
    const startDate = new Date(targetDate)
    startDate.setUTCHours(0, 0, 0, 0)

    const endDate = new Date(targetDate)
    endDate.setUTCHours(23, 59, 59, 999)

    // Gọi service với các đối tượng Date đã được chuẩn hóa
    const data = await this.dashboardService.getDashboardData(
      startDate,
      endDate,
      facilityId,
    )

    return {
      data,
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      statusCode: 200,
    }
  }

  @Get('by-week')
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard theo tuần' })
  @ApiQuery({ name: 'week', required: true, type: Number, example: 30 })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'facilityId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dữ liệu dashboard theo tuần' })
  async getDashboardDataByWeek(
    @Query('week', ParseIntPipe) week: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('facilityId') facilityId?: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.dashboardService.getDashboardDataByWeek(
      week,
      year,
      facilityId,
    )
    return {
      data,
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      statusCode: 200,
    }
  }

  @Get('by-month')
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard theo tháng' })
  @ApiQuery({ name: 'month', required: true, type: Number, example: 7 })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'facilityId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dữ liệu dashboard theo tháng' })
  async getDashboardDataByMonth(
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('facilityId') facilityId?: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.dashboardService.getDashboardDataByMonth(
      month,
      year,
      facilityId,
    )
    return {
      data,
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      statusCode: 200,
    }
  }

  @Get('by-quarter')
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard theo quý' })
  @ApiQuery({ name: 'quarter', required: true, type: Number, example: 3 })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'facilityId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dữ liệu dashboard theo quý' })
  async getDashboardDataByQuarter(
    @Query('quarter', ParseIntPipe) quarter: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('facilityId') facilityId?: string,
  ): Promise<ApiResponseDto<any>> {
    if (quarter < 1 || quarter > 4) {
      throw new BadRequestException('Quý phải là một số từ 1 đến 4.')
    }
    const data = await this.dashboardService.getDashboardDataByQuarter(
      quarter,
      year,
      facilityId,
    )
    return {
      data,
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      statusCode: 200,
    }
  }

  @Get('by-year')
  @ApiOperation({ summary: 'Lấy dữ liệu dashboard theo năm' })
  @ApiQuery({ name: 'year', required: true, type: Number, example: 2025 })
  @ApiQuery({ name: 'facilityId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Dữ liệu dashboard theo năm' })
  async getDashboardDataByYear(
    @Query('year', ParseIntPipe) year: number,
    @Query('facilityId') facilityId?: string,
  ): Promise<ApiResponseDto<any>> {
    const data = await this.dashboardService.getDashboardDataByYear(
      year,
      facilityId,
    )
    return {
      data,
      success: true,
      message: 'Lấy dữ liệu dashboard thành công',
      statusCode: 200,
    }
  }
}
