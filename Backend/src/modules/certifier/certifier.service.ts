import { ICertifierService } from './interfaces/icertifier.service'
import { ServiceCaseResponseDto } from 'src/modules/serviceCase/dto/serviceCaseResponse.dto'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from 'src/modules/testRequestStatus/schemas/testRequestStatus.schema'
import { ICertifierRepository } from './interfaces/icertifier.repository'
import { Injectable, NotFoundException } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { IAdnDocumentationRepository } from '../adnDocumentation/interfaces/iadnDocumentation.repository'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { AdnDocumentationResponseDto } from '../adnDocumentation/dto/adnDocumentationResponse.dto'

@Injectable()
export class CertifierService implements ICertifierService {
  constructor(
    @Inject(ICertifierRepository)
    private readonly certifierRepository: ICertifierRepository,
    @Inject(IAdnDocumentationRepository)
    private readonly adnDocumentationRepository: IAdnDocumentationRepository,
    @InjectModel(TestRequestStatus.name)
    private readonly testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  private mapServiceCasesToResponseDto(
    serviceCases: any[],
  ): ServiceCaseResponseDto[] {
    return serviceCases.map(
      (serviceCase) => new ServiceCaseResponseDto(serviceCase),
    )
  }

  async getAllServiceCasesWithoutResult(
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.certifierRepository.getAllServiceCasesWithoutResult(
        currentStatus,
        resultExists,
      )
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ dịch vụ nào với trạng thái hiện tại.',
      )
    }
    return this.mapServiceCasesToResponseDto(serviceCases)
  }

  async getCertifierTestRequestStatuses(): Promise<
    TestRequestStatusDocument[]
  > {
    // Assuming there's a method in the repository to get test request statuses
    return this.testRequestStatusModel
      .find({ order: { $in: [7, 8, 9, 10] } })
      .select('testRequestStatus order _id')
      .sort({ order: 1 })
      .exec()
  }

  async getDocumentationByServiceCaseId(
    serviceCaseId: string,
  ): Promise<AdnDocumentationResponseDto | null> {
    const documentation =
      await this.adnDocumentationRepository.findByServiceCaseId(serviceCaseId)
    if (!documentation) {
      throw new NotFoundException(
        'Không tìm thấy tài liệu ADN cho hồ sơ dịch vụ này.',
      )
    }
    return new AdnDocumentationResponseDto(documentation)
  }
}
