/* eslint-disable @typescript-eslint/no-base-to-string */
import { IAdnDocumentationService } from './interfaces/iadnDocumentation.service'
import { CreateAdnDocumentationDto } from './dto/createAdnDocumentation.dto'
import { AdnDocumentationResponseDto } from './dto/adnDocumentationResponse.dto'
import { IAdnDocumentationRepository } from './interfaces/iadnDocumentation.repository'
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { AdnDocumentationDocument } from './schemas/adnDocumentation.schema'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'

@Injectable()
export class AdnDocumentationService implements IAdnDocumentationService {
  constructor(
    @Inject(IAdnDocumentationRepository)
    private readonly adnDocumentationRepository: IAdnDocumentationRepository,
    @Inject(IServiceCaseRepository)
    private readonly serviceCaseRepository: IServiceCaseRepository,
    @Inject(ITestRequestStatusRepository)
    private readonly testRequestStatusRepository: ITestRequestStatusRepository,
  ) {}

  private mapToResponseDto(
    document: AdnDocumentationDocument,
  ): AdnDocumentationResponseDto {
    return new AdnDocumentationResponseDto(document)
  }

  async create(
    dto: CreateAdnDocumentationDto,
    doctorId: string,
  ): Promise<AdnDocumentationResponseDto> {
    const document = await this.adnDocumentationRepository.create(dto, doctorId)
    if (!document) {
      throw new Error('Không thể tạo tài liệu ADN')
    }
    await this.serviceCaseRepository.updateAdnDocumentation(
      document.serviceCase.toString(),
      document._id.toString(),
    )
    const newStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ duyệt kết quả',
      )
    await this.serviceCaseRepository.updateCurrentStatus(
      dto.serviceCase.toString(),
      newStatus.toString(),
      doctorId,
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
  ): Promise<AdnDocumentationResponseDto | null> {
    const document =
      await this.adnDocumentationRepository.findByServiceCaseId(serviceCaseId)
    if (!document) {
      throw new NotFoundException(
        'Không tìm thấy tài liệu ADN cho hồ sơ dịch vụ này.',
      )
    }
    return this.mapToResponseDto(document)
  }
}
