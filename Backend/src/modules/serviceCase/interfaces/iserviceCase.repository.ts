import { ServiceCaseDocument } from '../schemas/serviceCase.schema'
import { CreateServiceCaseDto } from '../dto/createServiceCase.dto'

export interface IServiceCaseRepository {
  createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
    totalFee: number,
  ): Promise<ServiceCaseDocument>
}
export const IServiceCaseRepository = Symbol('IServiceCaseRepository')
