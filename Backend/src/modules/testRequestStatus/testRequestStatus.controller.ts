import { Controller, Get, Inject } from '@nestjs/common'
import { ITestRequestStatusService } from './interfaces/itestRequestStatus.service'
import { ApiTags } from '@nestjs/swagger'
import { TestRequestStatusDocument } from './schemas/testRequestStatus.schema'

@ApiTags('TestRequestStatus')
@Controller('test-request-status')
export class TestRequestStatusController {
  constructor(
    @Inject(ITestRequestStatusService)
    private readonly testRequestStatusService: ITestRequestStatusService,
  ) {}

  @Get()
  async getAll(): Promise<TestRequestStatusDocument[]> {
    return this.testRequestStatusService.getAll()
  }

  @Get(':id')
  async findById(id: string): Promise<TestRequestStatusDocument> {
    return this.testRequestStatusService.findById(id)
  }
}
