import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { IDoctorService } from './interfaces/idoctor.service'
import { IDoctorRepository } from './interfaces/idoctor.repository'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

@Injectable()
export class DoctorService implements IDoctorService {
  constructor(
    @Inject(IDoctorRepository)
    private readonly doctorRepository: IDoctorRepository,
    @InjectModel(TestRequestStatus.name)
    private readonly testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  async getAllServiceCasesWithoutResults(
    facilityId: string,
    doctorId: string,
    currentStatus: string,
    resultExists: boolean,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.doctorRepository.getAllServiceCasesWithoutResults(
        facilityId,
        doctorId,
        currentStatus,
        resultExists,
      )
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nào tương ứng với yêu cầu của bạn.',
      )
    }
    return serviceCases.map(
      (serviceCase) => new ServiceCaseResponseDto(serviceCase),
    )
  }

  async getDoctorTestRequestStatuses(): Promise<TestRequestStatusDocument[]> {
    return this.testRequestStatusModel
      .find({ order: { $in: [6, 7, 8, 9] } })
      .sort({ order: 1 })
      .lean()
      .exec()
  }
}
