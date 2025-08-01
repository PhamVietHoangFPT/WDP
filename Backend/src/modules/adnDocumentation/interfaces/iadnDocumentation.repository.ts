import { CreateAdnDocumentationDto } from '../dto/createAdnDocumentation.dto'
import { AdnDocumentationDocument } from '../schemas/adnDocumentation.schema'

export interface IAdnDocumentationRepository {
  create(
    data: CreateAdnDocumentationDto,
    userId: string,
  ): Promise<AdnDocumentationDocument>
  findById(id: string): Promise<AdnDocumentationDocument | null>
  findByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationDocument[]>
}

export const IAdnDocumentationRepository = Symbol('IAdnDocumentationRepository')
