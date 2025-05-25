import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Inject,
  Query,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common'
import { ISlotService } from './interfaces/islot.service'
import { CreateSlotDto } from './dto/createSlot.dto'
import { QuerySlotDto } from './dto/querySlot.dto'
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger'
import { Slot } from './schemas/slot.schema'
import { AuthGuard } from 'src/common/guard/auth.guard'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'

@ApiTags('Slots')
@Controller('slots')
export class SlotController {
  constructor(
    @Inject(ISlotService)
    private readonly slotService: ISlotService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo một slot mới' })
  create(@Body() createSlotDto: CreateSlotDto) {
    return this.slotService.create(createSlotDto)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các slots (có thể lọc)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'YYYY-MM-DD',
  })
  @ApiQuery({ name: 'slotTemplateId', required: false, type: String })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    type: Boolean, // Swagger sẽ hiển thị dropdown true/false
    description: 'Lọc slot còn trống (true) hoặc đã đặt (false)',
  })
  findAll(@Query() querySlotDto: QuerySlotDto) {
    return this.slotService.findAll(querySlotDto)
  }

  // ... các endpoint findOne, update, remove giữ nguyên như trước ...
  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một slot theo ID' })
  findOne(@Param('id') id: string) {
    return this.slotService.findOne(id)
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Cập nhật thông tin một slot' })
  update(@Param('id') id: string, @Body() updateSlotDto: Partial<Slot>) {
    return this.slotService.update(id, updateSlotDto)
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Xóa một slot' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id
    await this.slotService.remove(id, userId)
    return new ApiResponseDto<null>({
      success: true,
      message: 'Xóa slot thành công',
      statusCode: HttpStatus.OK,
    })
  }
}
