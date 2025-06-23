import {
  Injectable,
  Inject,
  ConflictException,
  // NotFoundException,
  // BadRequestException,
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
@Injectable()
export class ServiceCaseService implements IServiceCaseService {
  constructor(
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
    @Inject(IServiceRepository)
    private serviceRepository: IServiceRepository,
    @Inject(ICaseMemberRepository)
    private caseMemberRepository: ICaseMemberRepository,
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
    const futureTime = new Date(now.getTime() + 10 * 60 * 1000)
    // Trường hợp chưa thanh toán
    const currentStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Chờ thanh toán',
      )
    const bookingId = await this.serviceCaseRepository.getBookingIdsByTime(
      futureTime,
      currentStatusId,
    )

    // Trường hợp thanh toán thất bại
    const failedPaymentStatusId =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Thanh toán thất bại',
      )
    const failedPaymentStatusBookingId =
      await this.serviceCaseRepository.getBookingIdsByTime(
        futureTime,
        failedPaymentStatusId,
      )

    console.log(bookingId, failedPaymentStatusBookingId)
  }
}
