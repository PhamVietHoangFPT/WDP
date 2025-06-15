import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ServiceCase, ServiceCaseDocument } from './schemas/serviceCase.schema'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { IServiceCaseRepository } from './interfaces/iserviceCase.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'

@Injectable()
export class ServiceCaseRepository implements IServiceCaseRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
  ) {}

  async createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
    totalFee: number,
  ): Promise<ServiceCaseDocument> {
    const testRequestStatus =
      await this.testRequestStatusRepository.findByTestRequestStatus(
        'Chờ thanh toán',
      )
    const createdServiceCase = new this.serviceCaseModel({
      ...createServiceCaseDto,
      created_by: userId,
      currentStatus: testRequestStatus,
      totalFee: totalFee,
      created_at: new Date(),
    })
    return createdServiceCase.save()
  }
}
