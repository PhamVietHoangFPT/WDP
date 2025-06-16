import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
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
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
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

  findAllServiceCases(
    filter: Record<string, unknown>,
  ): mongoose.Query<ServiceCaseDocument[], ServiceCaseDocument> {
    return this.serviceCaseModel
      .find(filter)
      .populate({ path: 'currentStatus', select: 'testRequestStatus -_id' })
      .lean()
  }

  async countDocuments(filter: Record<string, unknown>): Promise<number> {
    return this.serviceCaseModel.countDocuments(filter).exec()
  }

  async updatePayment(
    id: string,
    currentStatus: string,
    payment: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        currentStatus: new mongoose.Types.ObjectId(currentStatus),
        payment: new mongoose.Types.ObjectId(payment),
      },
      { new: true },
    )
    return updatedServiceCase
  }
}
