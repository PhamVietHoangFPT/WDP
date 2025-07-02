import { Injectable, NotFoundException, Inject } from '@nestjs/common'

import { IManagerRepository } from './interfaces/imanager.repository'
import { IManagerService } from './interfaces/imanager.service'
import { AccountResponseDto } from '../account/dto/accountResponse.dto'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'

@Injectable()
export class ManagerService implements IManagerService {
  constructor(
    @Inject(IManagerRepository)
    private readonly managerRepository: IManagerRepository,
  ) {}

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
}
