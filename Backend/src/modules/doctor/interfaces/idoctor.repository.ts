import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface IDoctorRepository {
  getAllServiceCasesWithoutResults(
    facilityId: string,
  ): Promise<ServiceCaseDocument[]>
}

export const IDoctorRepository = 'IDoctorRepository'
