import {
  Injectable,
  Inject,
  ConflictException,
  // NotFoundException,
  // BadRequestException,
  Logger,
} from '@nestjs/common'

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
  ) {}

  private mapToResponseDto(serviceCase: ServiceCase): ServiceCaseResponseDto {
    return new ServiceCaseResponseDto({
      _id: serviceCase._id,
      totalFee: serviceCase.totalFee,
      account: serviceCase.account,
      currentStatus: serviceCase.currentStatus,
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
    const numberOfTestTaker = caseMember.testTaker.length
    const serviceId =
      await this.caseMemberRepository.getServiceIdByCaseMemberId(
        createServiceCaseDto.caseMember,
      )
    const timeReturnId = await this.serviceRepository.getTimeReturnId(serviceId)
    const serviceTotalFee = await this.serviceRepository.getTotalFeeService(
      serviceId,
      timeReturnId,
      numberOfTestTaker,
    )

    const dataSend = {
      ...createServiceCaseDto,
      account: userId,
    }

    const serviceCase = await this.serviceCaseRepository.createServiceCase(
      dataSend,
      userId,
      serviceTotalFee,
    )
    return this.mapToResponseDto(serviceCase)
  }

  async findAllServiceCases(
    pageNumber: number,
    pageSize: number,
    userId: string,
  ): Promise<PaginatedResponse<ServiceCaseResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = { created_by: userId }
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
    currentStatus: string,
    staffId?: string,
    sampleCollectorId?: string,
    doctorId?: string,
  ): Promise<ServiceCaseResponseDto | null> {
    const oldServiceCaseStatusId =
      await this.serviceCaseRepository.getCurrentStatusId(id)

    const oldServiceCaseStatusOrder =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        oldServiceCaseStatusId,
      )

    const newServiceCaseStatusOrder =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        currentStatus,
      )

    if (newServiceCaseStatusOrder <= oldServiceCaseStatusOrder) {
      throw new ConflictException(
        'Trạng thái hiện tại không thể cập nhật xuống trạng thái cũ',
      )
    }
    let updatedServiceCase: ServiceCase | null
    if (newServiceCaseStatusOrder - oldServiceCaseStatusOrder > 1) {
      if (newServiceCaseStatusOrder === 4 && oldServiceCaseStatusOrder === 2) {
        updatedServiceCase =
          await this.serviceCaseRepository.updateCurrentStatus(
            id,
            currentStatus,
            staffId,
            sampleCollectorId,
            doctorId,
          )
        if (!updatedServiceCase) {
          throw new Error('Cập nhật trạng thái hiện tại không thành công')
        }
        return this.mapToResponseDto(updatedServiceCase)
      } else {
        throw new ConflictException(
          'Trạng thái hiện tại không thể cập nhật quá 1 bước từ trạng thái cũ',
        )
      }
    }

    updatedServiceCase = await this.serviceCaseRepository.updateCurrentStatus(
      id,
      currentStatus,
      staffId,
      sampleCollectorId,
      doctorId,
    )
    if (!updatedServiceCase) {
      throw new Error('Cập nhật trạng thái hiện tại không thành công')
    }
    return this.mapToResponseDto(updatedServiceCase)
  }

  @Cron('0 */3 * * * *')
  async handleCron() {
    const now = new Date()
    const futureTime = new Date(now.getTime())
    this.logger.log(
      `Bắt đầu cron job lúc ${now.toISOString()}, kiểm tra các lượt đặt sau ${futureTime.toISOString()}`,
    )
    // Trường hợp chưa thanh toán
    const currentStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ thanh toán',
      )
    const bookingIds = await this.serviceCaseRepository.getBookingIdsByTime(
      futureTime,
      currentStatusId,
    )

    // Trường hợp thanh toán thất bại
    const failedPaymentStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Thanh toán thất bại',
      )
    const failedPaymentStatusBookingIds =
      await this.serviceCaseRepository.getBookingIdsByTime(
        futureTime,
        failedPaymentStatusId,
      )

    // Trường hợp chưa thanh toán
    const unpaidBookingIds =
      await this.serviceCaseRepository.getBookingIdsByTime(futureTime, null)

    const allBookingIds = await this.bookingRepository.getAllBookingsIds()
    const bookingIdsToRemove: string[] = []
    for (const allBookingId of allBookingIds) {
      const isServiceCaseExist =
        await this.serviceCaseRepository.findByBookingId(allBookingId)
      if (!isServiceCaseExist) {
        // Nếu không có service case, thêm vào danh sách để xóa
        bookingIdsToRemove.push(allBookingId)
      }
    }
    for (const bookingIdToRemove of bookingIdsToRemove) {
      const slotId = await this.bookingRepository.getSlotIdByBookingId(
        bookingIdToRemove.toString(),
      )
      if (slotId) {
        const updateBookingStatus = await this.slotRepository.setBookingStatus(
          slotId.toString(),
          false,
        )
        if (!updateBookingStatus) {
          this.logger.log(
            `Cập nhật trạng thái đặt chỗ không thành công cho ID: ${bookingIdToRemove.toString()}`,
          )
        }
      } else {
        this.logger.log(
          `Không tìm thấy slot cho booking ID: ${bookingIdToRemove.toString()}`,
        )
      }
    }
    // Cập nhật trạng thái đặt chỗ cho các bookingIds
    if (
      bookingIds.length === 0 &&
      failedPaymentStatusBookingIds.length === 0 &&
      unpaidBookingIds.length === 0
    ) {
      this.logger.log(
        `Không có lượt đặt nào cần xử lý lúc ${now.toISOString()}`,
      )
      return
    }

    for (const bookingId of bookingIds) {
      const slotId = await this.bookingRepository.getSlotIdByBookingId(
        bookingId.toString(),
      )
      if (slotId) {
        const updateBookingStatus = await this.slotRepository.setBookingStatus(
          slotId.toString(),
          false,
        )
        if (!updateBookingStatus) {
          this.logger.log(
            `Cập nhật trạng thái đặt chỗ không thành công cho ID: ${bookingId.toString()}`,
          )
        }
      } else {
        this.logger.log(
          `Không tìm thấy slot cho booking ID: ${bookingId.toString()}`,
        )
      }
    }

    for (const failedPaymentStatusBookingId of failedPaymentStatusBookingIds) {
      const slotId = await this.bookingRepository.getSlotIdByBookingId(
        failedPaymentStatusBookingId.toString(),
      )
      if (slotId) {
        const updateFailedPaymentStatus =
          await this.slotRepository.setBookingStatus(slotId.toString(), false)
        if (!updateFailedPaymentStatus) {
          this.logger.log(
            `Cập nhật trạng thái đặt chỗ không thành công cho ID: ${failedPaymentStatusBookingId.toString()}`,
          )
        }
      } else {
        this.logger.log(
          `Không tìm thấy slot cho booking ID: ${failedPaymentStatusBookingId.toString()}`,
        )
      }
    }

    for (const unpaidBookingId of unpaidBookingIds) {
      const slotId = await this.bookingRepository.getSlotIdByBookingId(
        unpaidBookingId.toString(),
      )
      if (slotId) {
        const updateUnpaidBookingStatus =
          await this.slotRepository.setBookingStatus(slotId.toString(), false)
        if (!updateUnpaidBookingStatus) {
          this.logger.log(
            `Cập nhật trạng thái đặt chỗ không thành công cho ID: ${unpaidBookingId.toString()}`,
          )
        }
      } else {
        this.logger.log(
          `Không tìm thấy slot cho booking ID: ${unpaidBookingId.toString()}`,
        )
      }
    }

    this.logger.log(
      `Hoàn thành cron job lúc ${new Date().toISOString()} cho ${bookingIds.length} lượt đặt chờ thanh toán và ${failedPaymentStatusBookingIds.length} lượt thanh toán thất bại.`,
    )
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
}
