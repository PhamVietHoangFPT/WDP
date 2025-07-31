/* eslint-disable @typescript-eslint/no-base-to-string */
import { IAdnDocumentationService } from './interfaces/iadnDocumentation.service'
import { CreateAdnDocumentationDto } from './dto/createAdnDocumentation.dto'
import { AdnDocumentationResponseDto } from './dto/adnDocumentationResponse.dto'
import { IAdnDocumentationRepository } from './interfaces/iadnDocumentation.repository'
import { Injectable, Inject } from '@nestjs/common'
import { AdnDocumentationDocument } from './schemas/adnDocumentation.schema'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'

@Injectable()
export class AdnDocumentationService implements IAdnDocumentationService {
  constructor(
    @Inject(IAdnDocumentationRepository)
    private readonly adnDocumentationRepository: IAdnDocumentationRepository,
    @Inject(IServiceCaseRepository)
    private readonly serviceCaseRepository: IServiceCaseRepository,
  ) {}

  private mapToResponseDto(
    document: AdnDocumentationDocument,
  ): AdnDocumentationResponseDto {
    return new AdnDocumentationResponseDto(document)
  }

  async create(
    dto: CreateAdnDocumentationDto,
    userId: string,
  ): Promise<AdnDocumentationResponseDto> {
    const document = await this.adnDocumentationRepository.create(dto, userId)
    if (!document) {
      throw new Error('Không thể tạo tài liệu ADN')
    }
    await this.serviceCaseRepository.updateAdnDocumentation(
      document.serviceCase.toString(),
      document._id.toString(),
    )
    return this.mapToResponseDto(document)
  }

  async findById(id: string): Promise<AdnDocumentationResponseDto | null> {
    const document = await this.adnDocumentationRepository.findById(id)
    if (!document) return null
    return this.mapToResponseDto(document)
  }

  async findByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationResponseDto[]> {
    const documents =
      await this.adnDocumentationRepository.findByServiceCaseId(serviceCaseId)
    return documents.map((doc) => this.mapToResponseDto(doc))
  }
}
