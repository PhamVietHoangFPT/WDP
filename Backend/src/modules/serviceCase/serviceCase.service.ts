import { Injectable, Inject, ConflictException, Logger } from '@nestjs/common'

import { IServiceCaseRepository } from './interfaces/iserviceCase.repository'
import { IServiceCaseService } from './interfaces/iserviceCase.service'
import { CreateServiceCaseDto } from './dto/createServiceCase.dto'
import { ServiceCaseResponseDto } from './dto/serviceCaseResponse.dto'
import { ServiceCase } from './schemas/serviceCase.schema'
// import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
// import mongoose from 'mongoose'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'
import { IServiceRepository } from '../service/interfaces/iservice.repository'
import { ICaseMemberRepository } from '../caseMember/interfaces/icaseMember.repository'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { Cron } from '@nestjs/schedule'
import { ISlotRepository } from '../slot/interfaces/islot.repository'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'
import { VnpayService } from '../vnpay/vnpay.service'
import { IEmailService } from '../email/interfaces/iemail.service'
import { ITestRequestHistoryRepository } from '../testRequestHistory/interfaces/itestRequestHistory.repository'
@Injectable()
export class ServiceCaseService implements IServiceCaseService {
  private readonly logger = new Logger(ServiceCaseService.name)
  constructor(
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
    @Inject(IServiceRepository)
    private serviceRepository: IServiceRepository,
    @Inject(ICaseMemberRepository)
    private caseMemberRepository: ICaseMemberRepository,
    @Inject(ISlotRepository)
    private slotRepository: ISlotRepository,
    @Inject(IBookingRepository)
    private bookingRepository: IBookingRepository,
    @Inject(VnpayService)
    private readonly VnpayService: VnpayService,
    @Inject(IEmailService) private emailService: IEmailService,
    @Inject(ITestRequestHistoryRepository)
    private testRequestHistoryRepository: ITestRequestHistoryRepository,
  ) {}

  /**
   * Định nghĩa các bước chuyển đổi trạng thái hợp lệ.
   * LOGIC ĐÃ ĐƯỢC CẬP NHẬT THEO PHẢN HỒI.
   */
  VALID_TRANSITIONS: Record<number, number[]> = {
    // --- Luồng chính (Happy Path) ---
    0: [1, 11, 13], // Chờ thanh toán -> Đã thanh toán | Thanh toán thất bại | Hủy
    1: [2, 13], // Đã thanh toán -> Check-in | Hủy
    2: [3, 13], // Check-in -> Chờ xử lý | Hủy
    3: [4, 13], // Chờ xử lý -> Đang lấy mẫu | Hủy
    4: [5, 13], // Đang lấy mẫu -> Đã nhận mẫu | Hủy
    5: [6, 13], // Đã nhận mẫu -> Đang phân tích | Hủy
    6: [7, 13], // Đang phân tích -> Chờ duyệt kết quả | Hủy
    7: [8, 13], // Chờ duyệt kết quả -> Đã có kết quả | Hủy

    // --- ĐIỂM THAY ĐỔI QUAN TRỌNG ---
    8: [9, 12, 13], // Đã có kết quả -> Đã trả kết quả (THÀNH CÔNG) | Giao không thành công (THẤT BẠI) | Hủy
    9: [10], // Đã trả kết quả -> Hoàn thành (chỉ có một đường đi tới thành công)

    // --- Các luồng phụ và trạng thái kết thúc ---
    10: [], // Hoàn thành (trạng thái cuối cùng)
    11: [14], // Thanh toán thất bại -> Hủy do thanh toán không thành công
    12: [9, 13], // Giao kết quả không thành công -> Có thể thử lại việc trả kết quả (về 9) | Hủy
    13: [], // Hủy (trạng thái cuối cùng)
    14: [], // Hủy do thanh toán không thành công (trạng thái cuối cùng)
  }

  private mapToResponseDto(serviceCase: ServiceCase): ServiceCaseResponseDto {
    return new ServiceCaseResponseDto({
      _id: serviceCase._id,
      totalFee: serviceCase.totalFee,
      shippingFee: serviceCase.shippingFee,
      account: serviceCase.account,
      currentStatus: serviceCase.currentStatus,
      condition: serviceCase.condition ? serviceCase.condition : null,
      created_at: serviceCase.created_at,
      result: serviceCase.result,
      paymentForCondition: serviceCase.paymentForCondition
        ? serviceCase.paymentForCondition
        : null,
      sampleCollector: serviceCase.sampleCollector,
      doctor: serviceCase.doctor,
      caseMember: serviceCase.caseMember,
      adnDocumentation: serviceCase.adnDocumentation,
    })
  }

  async createServiceCase(
    createServiceCaseDto: CreateServiceCaseDto,
    userId: string,
  ): Promise<ServiceCaseResponseDto> {
    const caseMember = await this.caseMemberRepository.findById(
      createServiceCaseDto.caseMember,
    )
    if (!caseMember) {
      throw new Error('Hồ sơ nhóm thành viên xét nghiệm không tồn tại')
    }
    const existServiceCase =
      await this.serviceCaseRepository.findByCaseMemberId(
        createServiceCaseDto.caseMember,
      )
    if (existServiceCase) {
      throw new ConflictException(
        'Trường hợp xét nghiệm đã tồn tại cho nhóm thành viên này',
      )
    }

    const dataSend = {
      ...createServiceCaseDto,
      account: userId,
    }

    const serviceCase = await this.serviceCaseRepository.createServiceCase(
      dataSend,
      userId,
    )
    return this.mapToResponseDto(serviceCase)
  }

  async findAllServiceCases(
    pageNumber: number,
    pageSize: number,
    currentStatus: string | null,
    userId: string,
  ): Promise<PaginatedResponse<ServiceCaseResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    let filter = {}
    if (
      currentStatus !== 'null' &&
      currentStatus !== null &&
      currentStatus !== ''
    ) {
      filter = { currentStatus: currentStatus, created_by: userId }
    } else {
      filter = { created_by: userId }
    }
    const [totalItems, serviceCases] = await Promise.all([
      this.serviceCaseRepository.countDocuments(filter),
      this.serviceCaseRepository
        .findAllServiceCases(filter)
        .skip(skip)
        .limit(pageSize),
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = serviceCases.map((serviceCase) =>
      this.mapToResponseDto(serviceCase),
    )
    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNumber,
        pageSize,
      },
    }
  }

  async updateCurrentStatus(
    id: string,
    newStatusId: string, // Đổi tên biến để rõ ràng hơn
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
    deliveryStaffId?: string,
  ): Promise<ServiceCaseResponseDto | null> {
    // --- Bước 1: Lấy thông tin order của trạng thái cũ và mới ---
    const oldStatusId = await this.serviceCaseRepository.getCurrentStatusId(id)

    const oldOrder =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        oldStatusId,
      )

    const newOrder =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        newStatusId,
      )

    // --- Bước 2: Kiểm tra tính hợp lệ của việc chuyển trạng thái ---
    const allowedNextOrders = this.VALID_TRANSITIONS[oldOrder] || []

    if (!allowedNextOrders.includes(newOrder)) {
      // Câu báo lỗi có thể chi tiết hơn để dễ debug
      throw new ConflictException(
        `Không được phép chuyển từ trạng thái có order [${oldOrder}] sang [${newOrder}].`,
      )
    }

    // --- Bước 3: Nếu hợp lệ, tiến hành cập nhật ---
    const updatedServiceCase =
      await this.serviceCaseRepository.updateCurrentStatus(
        id,
        newStatusId, // Dùng ID trạng thái mới
        staffId,
        sampleCollectorId,
        doctorId,
        deliveryStaffId,
      )

    if (!updatedServiceCase) {
      throw new Error('Cập nhật trạng thái hiện tại không thành công.')
    }

    return this.mapToResponseDto(updatedServiceCase)
  }
  async updateCondition(
    id: string,
    condition: string,
    doctorId?: string,
  ): Promise<ServiceCaseResponseDto | null> {
    const existingServiceCase = await this.serviceCaseRepository.findOneById(id)
    if (!existingServiceCase) {
      throw new ConflictException('Không tìm thấy service case')
    }

    const serviceCaseStatusId =
      await this.serviceCaseRepository.getCurrentStatusId(id)
    const serviceCaseStatusOrder =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        serviceCaseStatusId,
      )
    if (serviceCaseStatusOrder !== 8) {
      throw new ConflictException('Không thể thay đổi chất lượng của mẫu thử')
    }

    const updated = await this.serviceCaseRepository.updateCondition(
      id,
      condition,
      doctorId,
    )
    if (!updated) {
      throw new ConflictException('Không thể cập nhật service case.')
    }

    await this.emailService.sendPaymentRequestForCondition(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      updated.account.toString(),
      doctorId,
    )
    return this.mapToResponseDto(updated)
  }

  @Cron('0 */3 * * * *')
  async handleCron() {
    this.logger.log(`Bắt đầu cron job lúc ${new Date().toISOString()}`)
    const currentTime = new Date()
    currentTime.setMinutes(currentTime.getMinutes() - 10)

    // 1. Lấy ID các trạng thái cần thiết (Giữ nguyên)
    const pendingStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ thanh toán',
      )
    const failedStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Thanh toán thất bại',
      )
    const cancelledStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Hủy do thanh toán không thành công',
      )

    // 2. Lấy danh sách cần xử lý
    const pendingCases = await this.serviceCaseRepository.getBookingIdsByTime(
      currentTime,
      pendingStatusId,
    )
    const failedCases = await this.serviceCaseRepository.getBookingIdsByTime(
      currentTime,
      failedStatusId,
    )

    const casesToProcess = [...pendingCases, ...failedCases]

    if (casesToProcess.length === 0) {
      this.logger.log('Không có hồ sơ nào cần xử lý.')
      return
    }

    this.logger.log(`Phát hiện ${casesToProcess.length} hồ sơ cần xử lý...`)

    // 3. Chuẩn bị các mảng ID từ kết quả đã lấy (Không có DB call)
    const serviceCaseIdsToCancel = casesToProcess.map((c) => c._id.toString())
    // Lấy slotId và lọc ra các giá trị rỗng/null để đảm bảo mảng sạch
    const slotIdsToFree = casesToProcess
      .map((c) => c.slotId?.toString())
      .filter(Boolean)
    // Chuẩn bị sẵn các document để ghi lịch sử
    const historyDocs = casesToProcess.map((c) => ({
      serviceCase: c._id,
      testRequestStatus: cancelledStatusId,
      account: c.account,
    }))

    // 4. THỰC HIỆN CẬP NHẬT HÀNG LOẠT (Chỉ 3 lệnh gọi DB)

    // Cập nhật tất cả slot cần giải phóng trong MỘT LỆNH
    if (slotIdsToFree.length > 0) {
      await this.slotRepository.updateMany(
        { _id: { $in: slotIdsToFree } },
        { isBooked: false },
      )
      this.logger.log(`Đã giải phóng ${slotIdsToFree.length} slot.`)
    }

    // Cập nhật tất cả service case sang trạng thái Hủy trong MỘT LỆNH
    if (serviceCaseIdsToCancel.length > 0) {
      // (Giả sử bạn cũng có/thêm updateMany vào ServiceCaseRepository)
      await this.serviceCaseRepository.updateMany(
        { _id: { $in: serviceCaseIdsToCancel } },
        { currentStatus: cancelledStatusId },
      )
      this.logger.log(`Đã hủy ${serviceCaseIdsToCancel.length} hồ sơ.`)

      // Ghi tất cả lịch sử trong MỘT LỆNH
      await this.testRequestHistoryRepository.insertMany(historyDocs)
      this.logger.log(`Đã ghi ${historyDocs.length} mục lịch sử.`)
    }

    this.logger.log(`Hoàn thành cron job.`)
  }

  @Cron('0 */30 8-17 * * *')
  async cancelServiceCaseIfNoCheckin(): Promise<void> {
    const currentStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Đã thanh toán. Chờ đến lịch hẹn đến cơ sở để check-in (nếu quý khách chọn lấy mẫu tại nhà, không cần đến cơ sở để check-in)',
      )

    const serviceCases =
      await this.serviceCaseRepository.findByCurrentStatusId(currentStatusId)

    if (!serviceCases || serviceCases.length === 0) {
      this.logger.log(
        'Không có trường hợp xét nghiệm nào cần hủy do không check-in.',
      )
      return
    }

    const now = new Date()
    const cancelStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName('Hủy')

    for (const serviceCaseId of serviceCases) {
      const checkinTime =
        await this.serviceCaseRepository.getServiceCaseCheckinTime(
          serviceCaseId,
        )
      if (now > checkinTime) {
        await this.serviceCaseRepository.updateCurrentStatus(
          serviceCaseId,
          cancelStatusId,
        )
        this.logger.log(
          `Đã hủy trường hợp xét nghiệm với ID: ${serviceCaseId} do không check-in.`,
        )
      }
    }
  }

  async findServiceCaseById(
    id: string,
  ): Promise<ServiceCaseResponseDto | null> {
    const serviceCase = await this.serviceCaseRepository.findById(id)
    if (!serviceCase) {
      return null
    }
    return this.mapToResponseDto(serviceCase)
  }
}
