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
import { IEmailService } from '../email/interfaces/iemail.service'
import { isMongoId } from 'class-validator'
@Injectable()
export class ResultService implements IResultService {
  constructor(
    @Inject(IResultRepository) private resultRepository: IResultRepository,
    @Inject(IServiceCaseRepository)
    private serviceCaseRepository: IServiceCaseRepository,
    @Inject(ITestRequestStatusRepository)
    private testRequestStatusRepository: ITestRequestStatusRepository,
    @Inject(IEmailService) private emailService: IEmailService,
  ) {}

  async create(
    createResultDto: CreateResultDto,
    doctorId: string,
  ): Promise<ResultDocument> {
    // Kiểm tra xem service case có tồn tại không
    // Kiểm tra xem trạng thái hiện tại đang ở đâu
    const currentStatusOfServiceCase =
      await this.serviceCaseRepository.getCurrentStatusId(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        createResultDto.serviceCase.toString(),
      )
    const isPaymentRequired =
      await this.serviceCaseRepository.checkPaidForCondition(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        createResultDto.serviceCase.toString(),
      )
    const currentOrderStatus =
      await this.testRequestStatusRepository.getTestRequestStatusOrder(
        currentStatusOfServiceCase,
      )
    if (currentOrderStatus < 7) {
      throw new ForbiddenException(
        'Không thể tạo kết quả khi trạng thái hiện tại của trường hợp xét nghiệm chưa hoàn thành.',
      )
    }

    if (currentOrderStatus === 9) {
      throw new ForbiddenException(
        'Không thể tạo kết quả khi trạng thái hiện tại của trường hợp xét nghiệm đã có kết quả.',
      )
    }

    if (currentOrderStatus > 9) {
      throw new ForbiddenException(
        'Không thể tạo kết quả khi trạng thái hiện tại của trường hợp xét nghiệm đã hoàn thành.',
      )
    }

    // Cập nhật lại trạng thái hiện tại của service case
    const newStatus =
      await this.testRequestStatusRepository.getTestRequestStatusIdByName(
        'Đã có kết quả',
      )
    const serviceCaseData =
      await this.serviceCaseRepository.updateCurrentStatus(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        createResultDto.serviceCase.toString(),
        newStatus.toString(),
        doctorId,
      )
    const data = await this.resultRepository.create(createResultDto)
    if (isPaymentRequired === false || isPaymentRequired === null) {
      await this.emailService.sendEmailForResult(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        serviceCaseData.account.toString(),
        data.adnPercentage,
        doctorId,
        data.conclusion,
      )
    }
    return data
  }

  async findById(id: string): Promise<ResultDocument | null> {
    if (isMongoId(id) === false) {
      throw new NotFoundException(`ID không hợp lệ: ${id}.`)
    }

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

  async findByIdForCustomer(id: string): Promise<ResultDocument | null> {
    if (isMongoId(id) === false) {
      throw new NotFoundException(`ID không hợp lệ: ${id}.`)
    }

    // Sử dụng tên hàm mới rõ ràng hơn
    const isPaymentRequired =
      await this.serviceCaseRepository.checkPaidForCondition(id)

    // Xử lý tường minh các trường hợp trả về
    switch (isPaymentRequired) {
      case true:
        // Case 1: Cần thanh toán -> Chặn truy cập
        throw new ForbiddenException(
          'Bạn cần thanh toán chi phí phát sinh trước khi xem kết quả.',
        )

      case null:
        // Case 2: Không tìm thấy hồ sơ dịch vụ -> Có thể là lỗi hoặc trường hợp đặc biệt
        // Tùy vào logic của bạn, bạn có thể chặn hoặc cho qua. Ở đây ta chặn để đảm bảo an toàn.
        throw new NotFoundException(
          'Không tìm thấy hồ sơ dịch vụ tương ứng với kết quả này.',
        )

      case false:
        // Case 3: Không cần thanh toán -> Tiếp tục thực thi
        break
    }

    const data = await this.resultRepository.findById(id)
    if (!data) {
      throw new NotFoundException('Không tìm thấy kết quả nào.')
    }
    return data
  }
}
