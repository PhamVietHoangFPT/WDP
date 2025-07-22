import { Get, Controller, Inject, Param, UseGuards } from '@nestjs/common'
import { IResultService } from './interfaces/iresult.service'
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger'
import { AuthGuard } from 'src/common/guard/auth.guard'

@Controller('results')
export class ResultController {
  constructor(@Inject(IResultService) private resultService: IResultService) {}

  @Get('for-customer/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', required: true })
  @ApiOperation({ summary: 'Lấy kết quả xét nghiệm cho khách hàng' })
  async findById(@Param('id') id: string) {
    return this.resultService.findByIdForCustomer(id)
  }
}
