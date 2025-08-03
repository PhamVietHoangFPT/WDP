import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { IDeliveryStaffService } from './interfaces/ideliveryStaff.service'
import { IDeliveryStaffRepository } from './interfaces/ideliveryStaff.repository'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import {
  TestRequestStatus,
  TestRequestStatusDocument,
} from '../testRequestStatus/schemas/testRequestStatus.schema'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
@Injectable()
export class DeliveryStaffService implements IDeliveryStaffService {
  constructor(
    @Inject(IDeliveryStaffRepository)
    private readonly deliveryStaffRepository: IDeliveryStaffRepository,
    @InjectModel(TestRequestStatus.name)
    private readonly testRequestStatusModel: Model<TestRequestStatusDocument>,
  ) {}

  async findAllServiceCasesByDeliveryStaffId(
    deliveryStaffId: string,
    currentStatus: string,
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.deliveryStaffRepository.findAllServiceCasesByDeliveryStaffId(
        deliveryStaffId,
        currentStatus,
        facilityId,
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

  async getDeliveryStaffTestRequestStatuses(): Promise<
    TestRequestStatusDocument[]
  > {
    return this.testRequestStatusModel
      .find({ order: { $in: [8, 9, 10] } })
      .sort({ order: 1 })
      .lean()
      .exec()
  }
}
