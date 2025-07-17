import { IStaffService } from './interfaces/istaff.service'
import { IStaffRepository } from './interfaces/istaff.repository'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'
import { Injectable } from '@nestjs/common'
import { Inject } from '@nestjs/common'

@Injectable()
export class StaffService implements IStaffService {
  constructor(
    @Inject(IStaffRepository)
    private readonly staffRepository: IStaffRepository,
  ) {}

  async getServiceCasesByCustomerEmail(
    facilityId: string,
    email: string,
    currentStatus: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.staffRepository.getServiceCasesByCustomerEmail(
        facilityId,
        email,
        currentStatus,
      )
    return serviceCases.map(
      (serviceCase) => new ServiceCaseResponseDto(serviceCase),
    )
  }
}
