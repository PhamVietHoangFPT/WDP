import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import { TestRequestStatusDocument } from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'
import { AdnDocumentationResponseDto } from 'src/modules/adnDocumentation/dto/adnDocumentationResponse.dto'
export interface ICertifierService {
  getAllServiceCasesWithoutResult(
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseResponseDto[]>

  getCertifierTestRequestStatuses(): Promise<TestRequestStatusDocument[]>

  getDocumentationByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationResponseDto | null>
}

export const ICertifierService = 'ICertifierService'
