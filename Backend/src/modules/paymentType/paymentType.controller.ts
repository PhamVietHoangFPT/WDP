import { Controller, Get, Inject } from '@nestjs/common'
import { IPaymentTypeService } from './interfaces/ipaymentType.service'
import { PaymentTypeDocument } from './schemas/paymentType.schema'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('payment-type')
@Controller('payment-type')
export class PaymentTypeController {
  constructor(
    @Inject(IPaymentTypeService)
    private readonly paymentTypeService: IPaymentTypeService,
  ) {}

  @Get()
  async getAll(): Promise<PaymentTypeDocument[]> {
    return this.paymentTypeService.getAll()
  }

  @Get(':id')
  async findById(id: string): Promise<PaymentTypeDocument> {
    return this.paymentTypeService.findById(id)
  }
}
