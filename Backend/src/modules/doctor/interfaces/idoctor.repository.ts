import { ServiceCaseDocument } from 'src/modules/serviceCase/schemas/serviceCase.schema'

export interface IDoctorRepository {
  getAllServiceCasesWithoutAdnDocumentation(
    doctorId: string,
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseDocument[]>
}

export const IDoctorRepository = 'IDoctorRepository'
