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

  updatePayment(
    id: string,
    currentStatus: string,
    payment: string,
  ): Promise<ServiceCaseDocument | null>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
  ): Promise<ServiceCaseDocument | null>

  findByCaseMemberId(caseMemberId: string): Promise<string | null>

  getCurrentStatusId(id: string): Promise<string | null>

  getTotalFeeById(id: string): Promise<number | null>

  updateResultId(
    id: string,
    resultId: string,
  ): Promise<ServiceCaseDocument | null>
}
export const IServiceCaseRepository = Symbol('IServiceCaseRepository')
