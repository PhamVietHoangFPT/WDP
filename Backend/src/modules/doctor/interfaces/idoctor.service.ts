import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'

export interface IDoctorService {
  getAllServiceCasesWithoutResults(
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]>
}

export const IDoctorService = 'IDoctorService'
