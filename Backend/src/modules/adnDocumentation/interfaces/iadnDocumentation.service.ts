import { CreateAdnDocumentationDto } from '../dto/createAdnDocumentation.dto'
import { AdnDocumentationResponseDto } from '../dto/adnDocumentationResponse.dto'

export interface IAdnDocumentationService {
  create(
    dto: CreateAdnDocumentationDto,
    userId: string,
  ): Promise<AdnDocumentationResponseDto>

  findById(id: string): Promise<AdnDocumentationResponseDto | null>

  findByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationResponseDto[]>
}

export const IAdnDocumentationService = Symbol('IAdnDocumentationService')
