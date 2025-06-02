import { Controller, Get, Param, Inject, Query } from '@nestjs/common'
import { ISlotService } from './interfaces/islot.service'
import { QuerySlotDto } from './dto/querySlot.dto'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'

@ApiTags('slots')
@Controller('slots')
export class SlotController {
  constructor(
    @Inject(ISlotService)
    private readonly slotService: ISlotService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách các slots theo cơ sở' })
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
  @ApiQuery({ name: 'facilityId', required: true, type: String })
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
}
