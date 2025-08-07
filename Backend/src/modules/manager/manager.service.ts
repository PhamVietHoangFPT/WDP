import { Injectable, NotFoundException, Inject } from '@nestjs/common'

import { IManagerRepository } from './interfaces/imanager.repository'
import { IManagerService } from './interfaces/imanager.service'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { RoleDocument } from '../role/schemas/role.schema'
import { ManagerCreateAccountDto } from './dto/managerCreateAccount.dto'
import { Account } from '../account/schemas/account.schema'
import { KitShipmentResponseDto } from '../KitShipment/dto/kitShipmentResponse.dto'

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
      deleted_at: user.deleted_at,
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
    bookingDate: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.managerRepository.getAllServiceCasesWithoutSampleCollector(
        facilityId,
        isAtHome,
        bookingDate,
      )
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nào chưa có nhân viên lấy mẫu',
      )
    }
    return serviceCases.map((item) => new ServiceCaseResponseDto(item))
  }

  async getAllKitShipmentsWithoutDeliveryStaff(
    facilityId: string,
    bookingDate: string,
  ): Promise<KitShipmentResponseDto[]> {
    const kitShipments =
      await this.managerRepository.getAllKitShipmentWithoutDeliveryStaff(
        facilityId,
        bookingDate,
      )
    if (!kitShipments || kitShipments.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy kitshipment nào chưa có nhân viên giao hàng',
      )
    }
    return kitShipments.map((item) => new KitShipmentResponseDto(item))
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

  async assignShipResultToDeliverStaff(
    serviceCaseId: string,
    deliveryStaffId: string,
    userId: string,
  ): Promise<ServiceCaseResponseDto> {
    const serviceCase =
      await this.managerRepository.assignShipResultToDeliverStaff(
        serviceCaseId,
        deliveryStaffId,
        userId,
      )
    if (!serviceCase) {
      throw new NotFoundException('Không tìm thấy hồ sơ dịch vụ')
    }
    return new ServiceCaseResponseDto(serviceCase)
  }

  async assignDeliveryStaffToKitShipment(
    kitShipmentId: string,
    deliveryStaffId: string,
    userId: string,
  ): Promise<KitShipmentResponseDto> {
    const kitShipment =
      await this.managerRepository.assignDeliveryStaffToKitShipment(
        kitShipmentId,
        deliveryStaffId,
        userId,
      )
    if (!kitShipment) {
      throw new NotFoundException('Không tìm thấy hồ sơ vận chuyển')
    }
    return new KitShipmentResponseDto(kitShipment)
  }

  async getAllServiceCaseWithoutDoctor(
    facilityId: string,
    bookingDate: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.managerRepository.getAllServiceCaseWithoutDoctor(
        facilityId,
        bookingDate,
      )
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

  async getAllServiceCasesWithoutDeliveryStaff(
    facilityId: string,
    bookingDate: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.managerRepository.getAllServiceCasesWithoutDeliveryStaff(
        facilityId,
        bookingDate,
      )
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ dịch vụ nào chưa có nhân viên giao hàng',
      )
    }
    return serviceCases.map((item) => new ServiceCaseResponseDto(item))
  }

  async getAllStaffs(
    facilityId: string,
    userRole: string,
    email?: string,
    role?: string,
  ): Promise<AccountResponseDto[]> {
    const staffs = await this.managerRepository.getAllStaffs(
      facilityId,
      userRole,
      email,
      role,
    )
    if (!staffs || staffs.length === 0) {
      throw new NotFoundException('Không tìm thấy nhân viên nào')
    }
    return staffs.map((item) => this.mapToResponseDto(item))
  }

  async deleteAccount(
    accountId: string,
    userId: string,
  ): Promise<AccountResponseDto> {
    const deletedAccount = await this.managerRepository.deleteAccount(
      accountId,
      userId,
    )
    if (!deletedAccount) {
      throw new NotFoundException('Không tìm thấy tài khoản để xóa')
    }
    return this.mapToResponseDto(deletedAccount)
  }
}
