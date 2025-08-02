import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface ICertifierRepository {
  getAllServiceCasesWithoutResult(
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseDocument[]>
}

export const ICertifierRepository = 'ICertifierRepository'
