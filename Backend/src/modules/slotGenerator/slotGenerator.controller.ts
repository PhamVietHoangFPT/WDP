import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { SlotGenerationService } from './slotGenerator.service'
import { SlotGeneratorDto } from './dto/slotGenerator.dto'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { RolesGuard } from 'src/common/guard/roles.guard'
import { Roles } from 'src/common/decorators/roles.decorator'
import { RoleEnum } from 'src/common/enums/role.enum'
@ApiTags('Admin - Slot Generation')
@ApiBearerAuth('bearer') // Sử dụng tên security scheme của bạn
@UseGuards(AuthGuard, RolesGuard)
@Controller('admin/slot-generation')
export class SlotGenerationController {
  constructor(private readonly slotGenerationService: SlotGenerationService) {}

  @Post('trigger')
  @Roles(RoleEnum.ADMIN) // Chỉ cho phép người dùng có vai trò Admin
  @HttpCode(HttpStatus.ACCEPTED) // Trả về 202 Accepted vì đây có thể là tác vụ chạy nền
  @ApiOperation({
    summary: 'Kích hoạt thủ công việc tạo slot cho một khoảng thời gian.',
  })
  @ApiResponse({
    status: 202,
    description: 'Yêu cầu tạo slot đã được chấp nhận và đang xử lý.',
  })
  async triggerManualGeneration(
    @Body() triggerDto: SlotGeneratorDto, // Sử dụng @Body thay vì @Query nếu muốn gửi nhiều tham số hoặc POST
  ) {
    const { daysToGenerate, startDate } = triggerDto
    const result = await this.slotGenerationService.triggerSlotGeneration(
      daysToGenerate,
      startDate,
    )
    return {
      message: 'Yêu cầu tạo slot thủ công đã được xử lý.',
      details: result,
    }
  }

  @Delete('delete-slot')
  @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED) // Trả về 202 Accepted vì đây có thể là tác vụ chạy nền
  @ApiOperation({
    summary: 'Xóa tất cả slot đã hết hạn.',
  })
  @ApiResponse({
    status: 202,
    description: 'Yêu cầu xóa slot đã được chấp nhận và đang xử lý.',
  })
  async deleteExpiredSlots() {
    const result = await this.slotGenerationService.handleOverdueSlotCleanup()
    return {
      message: 'Yêu cầu xóa slot đã hết hạn đã được xử lý.',
      details: result,
    }
  }
}
