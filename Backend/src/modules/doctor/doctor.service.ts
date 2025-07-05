import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { IDoctorService } from './interfaces/idoctor.service'
import { IDoctorRepository } from './interfaces/idoctor.repository'
import { ServiceCaseResponseDto } from '../serviceCase/dto/serviceCaseResponse.dto'

@Injectable()
export class DoctorService implements IDoctorService {
  constructor(
    @Inject(IDoctorRepository)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async getAllServiceCasesWithoutResults(
    facilityId: string,
  ): Promise<ServiceCaseResponseDto[]> {
    const serviceCases =
      await this.doctorRepository.getAllServiceCasesWithoutResults(facilityId)
    if (!serviceCases || serviceCases.length === 0) {
      throw new NotFoundException('Không tìm thấy hồ sơ nào chưa có kết quả')
    }
    return serviceCases.map(
      (serviceCase) => new ServiceCaseResponseDto(serviceCase),
    )
  }
}
