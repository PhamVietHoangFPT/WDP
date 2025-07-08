import { Injectable, NotFoundException, Inject } from '@nestjs/common'

import { IManagerRepository } from './interfaces/imanager.repository'
import { IManagerService } from './interfaces/imanager.service'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { RoleDocument } from '../role/schemas/role.schema'
import { ManagerCreateAccountDto } from './dto/managerCreateAccount.dto'
import { Account } from '../account/schemas/account.schema'

@Injectable()
export class ManagerService implements IManagerService {
  constructor(
    @Inject(IManagerRepository)
    private readonly managerRepository: IManagerRepository,
  ) {}

  private mapToResponseDto(user: Account): AccountResponseDto {
    return new AccountResponseDto({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      facility: user.facility,
    })
  }

  async getAllSampleCollectors(
    facilityId: string,
  ): Promise<AccountResponseDto[]> {
    const sampleCollectors =
      await this.managerRepository.getAllSampleCollectors(facilityId)
    if (!sampleCollectors || sampleCollectors.length === 0) {
      throw new NotFoundException('Không tìm thấy nhân viên lấy mẫu nào')
    }
    return sampleCollectors.map((item) => new AccountResponseDto(item))
  }

  async getAllDoctors(facilityId: string): Promise<AccountResponseDto[]> {
    const doctors = await this.managerRepository.getAllDoctors(facilityId)
    if (!doctors || doctors.length === 0) {
      throw new NotFoundException('Không tìm thấy bác sĩ nào')
    }
    return doctors.map((item) => new AccountResponseDto(item))
  }

  async getAllServiceCasesWithoutSampleCollector(
    facilityId: string,
    isAtHome: boolean,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.managerRepository.getAllServiceCasesWithoutSampleCollector(
        facilityId,
        isAtHome,
      )
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nào chưa có nhân viên lấy mẫu',
      )
    }
    return serviceCases.map((item) => new ServiceCaseResponseDto(item))
  }

  async assignSampleCollectorToServiceCase(
    serviceCaseId: string,
    sampleCollectorId: string,
    userId: string,
  ): Promise<ServiceCaseResponseDto> {
    const serviceCase =
      await this.managerRepository.assignSampleCollectorToServiceCase(
        serviceCaseId,
        sampleCollectorId,
        userId,
      )
    if (!serviceCase) {
      throw new NotFoundException('Không tìm thấy hồ sơ dịch vụ')
    }
    return new ServiceCaseResponseDto(serviceCase)
  }

  async getAllServiceCaseWithoutDoctor(
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.managerRepository.getAllServiceCaseWithoutDoctor(facilityId)
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException('Không tìm thấy hồ sơ dịch vụ nào')
    }
    return serviceCases.map((item) => new ServiceCaseResponseDto(item))
  }

  async assignDoctorToServiceCase(
    serviceCaseId: string,
    doctorId: string,
    userId: string,
  ): Promise<ServiceCaseResponseDto> {
    const serviceCase = await this.managerRepository.assignDoctorToServiceCase(
      serviceCaseId,
      doctorId,
      userId,
    )
    if (!serviceCase) {
      throw new NotFoundException('Không tìm thấy hồ sơ dịch vụ')
    }
    return new ServiceCaseResponseDto(serviceCase)
  }

  async managerCreateAccount(
    accountData: Partial<ManagerCreateAccountDto>,
    userId: string,
    facilityId: string,
  ): Promise<AccountResponseDto> {
    const createdAccount = await this.managerRepository.managerCreateAccount(
      accountData,
      userId,
      facilityId,
    )
    if (!createdAccount) {
      throw new NotFoundException('Không thể tạo tài khoản')
    }
    return this.mapToResponseDto(createdAccount)
  }

  async managerGetAllRoles(): Promise<RoleDocument[]> {
    const roles = await this.managerRepository.managerGetAllRoles()
    if (!roles || roles.length === 0) {
      throw new NotFoundException('Không tìm thấy vai trò nào')
    }
    return roles
  }

  async getAllDeliveryStaff(facilityId: string): Promise<AccountResponseDto[]> {
    const deliveryStaff =
      await this.managerRepository.getAllDeliveryStaff(facilityId)
    if (!deliveryStaff || deliveryStaff.length === 0) {
      throw new NotFoundException('Không tìm thấy nhân viên giao hàng nào')
    }
    return deliveryStaff.map((item) => new AccountResponseDto(item))
  }
}
