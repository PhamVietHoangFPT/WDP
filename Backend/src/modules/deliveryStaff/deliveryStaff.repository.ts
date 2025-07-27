import {
  ServiceCase,
  ServiceCaseDocument,
} from '../serviceCase/schemas/serviceCase.schema'
import { Injectable } from '@nestjs/common'
import { Model, Types } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { IDeliveryStaffRepository } from './interfaces/ideliveryStaff.repository'

@Injectable()
export class DeliveryStaffRepository implements IDeliveryStaffRepository {
  constructor(
    @InjectModel(ServiceCase.name)
    private serviceCaseModel: Model<ServiceCaseDocument>,
  ) {}

  async findAllServiceCasesByDeliveryStaffId(
    deliveryStaffId: string,
    currentStatus: string,
  ): Promise<ServiceCaseDocument[]> {
    return this.serviceCaseModel
      .find({
        deliveryStaff: new Types.ObjectId(deliveryStaffId),
        currentStatus: new Types.ObjectId(currentStatus),
      })
      .exec()
  }
}
