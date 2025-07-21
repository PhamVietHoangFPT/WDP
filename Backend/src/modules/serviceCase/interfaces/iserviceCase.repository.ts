import { UpdateConditionDto } from './../../condition/dto/updateCondition.dto';
import { ServiceCaseDocument } from '../schemas/serviceCase.schema'
import { CreateServiceCaseDto } from '../dto/createServiceCase.dto'
import mongoose from 'mongoose'

export interface IServiceCaseRepository {
  createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
    totalFee: number,
  ): Promise<ServiceCaseDocument>

  findAllServiceCases(
    filter: Record<string, unknown>,
  ): mongoose.Query<ServiceCaseDocument[], ServiceCaseDocument>

  countDocuments(filter: Record<string, unknown>): Promise<number>
  findOneById(id: string): Promise<ServiceCaseDocument | null>

  updatePayment(
    id: string,
    currentStatus: string,
    payment: string,
  ): Promise<ServiceCaseDocument | null>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null>

  updateCondition(
    id: string,
    condition: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null>

  findByCaseMemberId(caseMemberId: string): Promise<string | null>

  getCurrentStatusId(id: string): Promise<string | null>

  getTotalFeeById(id: string): Promise<number | null>

  updateResultId(
    id: string,
    resultId: string,
  ): Promise<ServiceCaseDocument | null>

  getBookingIdsByTime(time: Date, currentStatusId: string): Promise<string[]>

  findByBookingId(bookingId: string): Promise<boolean | null>

  findByCurrentStatusId(currentStatusId: string): Promise<string[] | null>

  getServiceCaseCheckinTime(serviceCaseId: string): Promise<Date | null>

  getConditionFeeById(id: string): Promise<number | null>

}
export const IServiceCaseRepository = Symbol('IServiceCaseRepository')
