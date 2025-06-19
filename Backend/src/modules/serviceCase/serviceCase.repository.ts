/* eslint-disable @typescript-eslint/no-base-to-string */
import { Inject, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import mongoose, { Model } from 'mongoose'
import { ServiceCase, ServiceCaseDocument } from './schemas/serviceCase.schema'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { IServiceCaseRepository } from './interfaces/iserviceCase.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
import { ITestRequestHistoryRepository } from '../testRequestHistory/interfaces/itestRequestHistory.repository'

@Injectable()
export class ServiceCaseRepository implements IServiceCaseRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
    @Inject(ITestRequestHistoryRepository)
    private testRequestHistoryRepository: ITestRequestHistoryRepository,
  ) {}

  findAllServiceCases(
    filter: Record<string, unknown>,
  ): mongoose.Query<ServiceCaseDocument[], ServiceCaseDocument> {
    return this.serviceCaseModel
      .find(filter)
      .populate({ path: 'currentStatus', select: 'testRequestStatus -_id' })
      .lean()
  }

  async createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
    totalFee: number,
  ): Promise<ServiceCaseDocument> {
    const testRequestStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ thanh toán',
      )
    const createdServiceCase = await this.serviceCaseModel.create({
      ...createServiceCaseDto,
      created_by: userId,
      currentStatus: testRequestStatus,
      totalFee: totalFee,
      created_at: new Date(),
    })

    await this.testRequestHistoryRepository.createTestRequestHistory(
      createdServiceCase._id.toString(),
      testRequestStatus.toString(),
      userId,
    )

    return createdServiceCase
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

    await this.testRequestHistoryRepository.createTestRequestHistory(
      updatedServiceCase?._id.toString(),
      currentStatus,
      updatedServiceCase?.created_by.toString(),
    )
    return updatedServiceCase
  }

  async updateCurrentStatus(
    id: string,
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null> {
    const updatedServiceCase = await this.serviceCaseModel.findByIdAndUpdate(
      id,
      {
        currentStatus: new mongoose.Types.ObjectId(currentStatus),
        staff: staffId ? new mongoose.Types.ObjectId(staffId) : null,
        sampleCollector: sampleCollectorId
          ? new mongoose.Types.ObjectId(sampleCollectorId)
          : null,
        doctor: doctorId ? new mongoose.Types.ObjectId(doctorId) : null,
      },
      { new: true },
    )

    await this.testRequestHistoryRepository.createTestRequestHistory(
      updatedServiceCase?._id.toString(),
      currentStatus,
      updatedServiceCase?.created_by.toString(),
      staffId,
      sampleCollectorId,
      doctorId,
    )
    return updatedServiceCase
  }

  async findByCaseMemberId(caseMemberId: string): Promise<string | null> {
    const serviceCase = await this.serviceCaseModel
      .findOne({ caseMember: new mongoose.Types.ObjectId(caseMemberId) })
      .select('_id')
      .lean()
    return serviceCase ? serviceCase._id.toString() : null
  }

  async getCurrentStatusId(id: string): Promise<string | null> {
    const serviceCase = await this.serviceCaseModel
      .findById(id)
      .select('currentStatus')
      .lean()
    return serviceCase && serviceCase.currentStatus
      ? serviceCase.currentStatus.toString()
      : null
  }

  async getTotalFeeById(id: string): Promise<number | null> {
    const serviceCase = await this.serviceCaseModel
      .findById(id)
      .select('totalFee')
      .lean()
    return serviceCase ? serviceCase.totalFee : null
  }

  async updateResultId(
    id: string,
    resultId: string,
  ): Promise<ServiceCaseDocument | null> {
    return this.serviceCaseModel
      .findByIdAndUpdate(
        id,
        { result: new mongoose.Types.ObjectId(resultId) },
        { new: true },
      )
      .exec()
  }
}
