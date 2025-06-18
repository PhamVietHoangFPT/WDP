import { Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SampleCollectorService } from './sampleCollector.service'

@ApiTags('Sample Collector')
@Controller('sample-collector')
export class SampleCollectorController {
  constructor(
    private readonly sampleCollectorService: SampleCollectorService,
  ) {}

  @Post('assign-job')
  @ApiOperation({
    summary: 'Assign jobs to sample collectors',
    description: 'This endpoint assigns jobs to sample collectors.',
  })
  async assignJob() {
    return this.sampleCollectorService.assignJob()
  }
}
