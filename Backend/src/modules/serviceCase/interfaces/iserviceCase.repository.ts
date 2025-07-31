import { ServiceCase, ServiceCaseDocument } from '../schemas/serviceCase.schema'
import { CreateServiceCaseDto } from '../dto/createServiceCase.dto'
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose'

export interface IServiceCaseRepository {
  createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
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

  updatePaymentForCondition(
    id: string,
    paymentForCondition: string,
  ): Promise<ServiceCaseDocument | null>

  updateCurrentStatus(
    id: string,
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
    deliveryStaffId?: string,
  ): Promise<ServiceCaseDocument | null>

  updateCondition(
    id: string,
    condition: string,
    doctorId?: string,
  ): Promise<ServiceCaseDocument | null>

  findByCaseMemberId(caseMemberId: string): Promise<string | null>

  getCurrentStatusId(id: string): Promise<string | null>

  getTotalFeeById(id: string): Promise<number | null>

  getShippingFeeById(id: string): Promise<number | null>

  updateResultId(
    id: string,
    resultId: string,
  ): Promise<ServiceCaseDocument | null>

  getBookingIdsByTime(
    time: Date,
    currentStatusId: string,
  ): Promise<
    { _id: string; bookingId: string; slotId: string; account: string }[]
  >

  findByBookingId(bookingId: string): Promise<boolean | null>

  findByCurrentStatusId(currentStatusId: string): Promise<string[] | null>

  getServiceCaseCheckinTime(serviceCaseId: string): Promise<Date | null>

  getConditionFeeById(id: string): Promise<number | null>

  /**
   * Kiểm tra xem một service case có yêu cầu thanh toán cho chi phí phát sinh (condition) hay không.
   * @returns `true` nếu cần thanh toán.
   * @returns `false` nếu không cần thanh toán (do không có condition hoặc đã thanh toán rồi).
   * @returns `null` nếu không tìm thấy service case.
   */
  checkPaidForCondition(resultId: string): Promise<boolean | null>

  updateMany(
    filter: FilterQuery<ServiceCase>,
    update: UpdateQuery<ServiceCase>,
  ): Promise<any>

  checkIsSelfSampling(serviceCaseId: string): Promise<boolean | null>

  updateAdnDocumentation(
    serviceCaseId: string,
    adnDocumentationId: string,
  ): Promise<ServiceCaseDocument | null>
}
export const IServiceCaseRepository = Symbol('IServiceCaseRepository')
