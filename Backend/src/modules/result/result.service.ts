import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'

import { IResultService } from './interfaces/iresult.service'
import { IResultRepository } from './interfaces/iresult.repository'
import { CreateResultDto } from './dto/createResult.dto'
import { UpdateResultDto } from './dto/updateResult.dto'
import { ResultDocument } from './schemas/result.schema'
import { IServiceCaseRepository } from '../serviceCase/interfaces/iserviceCase.repository'
import { ITestRequestStatusRepository } from '../testRequestStatus/interfaces/itestRequestStatus.repository'

@Injectable()
export class ResultService implements IResultService {
  constructor(
    @Inject(IResultRepository) private resultRepository: IResultRepository,
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
  ) {}

  async create(
    createResultDto: CreateResultDto,
    doctorId: string,
  ): Promise<ResultDocument> {
    // Kiểm tra xem service case có tồn tại không
    const currentStatusOfServiceCase =
      await this.serviceCaseRepository.getCurrentStatusId(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        createResultDto.serviceCase.toString(),
      )
    // Kiểm tra xem trạng thái hiện tại đang ở đâu
    const currentOrderStatus =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        currentStatusOfServiceCase,
      )
    if (currentOrderStatus < 7) {
      throw new ForbiddenException(
        'Không thể tạo kết quả khi trạng thái hiện tại của trường hợp xét nghiệm chưa hoàn thành.',
      )
    }

    // Cập nhật lại trạng thái hiện tại của service case
    const newStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Đã có kết quả',
      )
    await this.serviceCaseRepository.updateCurrentStatus(
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      createResultDto.serviceCase.toString(),
      newStatus.toString(),
      doctorId,
    )
    return await this.resultRepository.create(createResultDto)
  }

  async findById(id: string): Promise<ResultDocument | null> {
    const data = await this.resultRepository.findById(id)
    if (!data) {
      throw new NotFoundException('Không tìm thấy kết quả nào.')
    }
    return data
  }

  async update(
    id: string,
    updateResultDto: UpdateResultDto,
  ): Promise<ResultDocument | null> {
    const existingResult = await this.resultRepository.findById(id)
    if (!existingResult) {
      throw new NotFoundException(`Không tìm thấy kết quả với ID ${id}.`)
    }

    if (
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      existingResult.doctorId.toString() !== updateResultDto.doctorId.toString()
    ) {
      throw new ForbiddenException('Bạn không có quyền cập nhật kết quả này.')
    }

    // Kiểm tra xem kết quả đã được cập nhật hay chưa
    const isUpdated = await this.resultRepository.checkIsUpdated(id)
    if (isUpdated) {
      throw new ForbiddenException(
        'Kết quả đã từng được cập nhật, không thể sửa đổi.',
      )
    }

    return this.resultRepository.update(id, updateResultDto)
  }
}
