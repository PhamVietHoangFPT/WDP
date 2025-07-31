import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'

export interface IDoctorService {
  getAllServiceCasesWithoutAdnDocumentation(
    facilityId: string,
    doctorId: string,
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseResponseDto[]>

  getDoctorTestRequestStatuses(): Promise<TestRequestStatusDocument[]>
}

export const IDoctorService = 'IDoctorService'
