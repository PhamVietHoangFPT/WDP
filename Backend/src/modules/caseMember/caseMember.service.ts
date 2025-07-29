import {
  Injectable,
  NotFoundException,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { CaseMember } from './schemas/caseMember.schema'
import { ICaseMemberRepository } from './interfaces/icaseMember.repository'
import { ICaseMemberService } from './interfaces/icaseMember.service'
import { CreateCaseMemberDto } from './dto/createCaseMember.dto'
import { CaseMemberResponseDto } from './dto/caseMemberResponse.dto'
import { ITestTakerRepository } from '../testTaker/interfaces/itestTaker.repository'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'
import { ISamplingKitInventoryRepository } from '../samplingKitInventory/interfaces/isamplingKitInventory.repository'
import { IServiceRepository } from '../service/interfaces/iservice.repository'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

@Injectable()
export class CaseMemberService implements ICaseMemberService {
  constructor(
    @Inject(ICaseMemberRepository)
    private readonly caseMemberRepository: ICaseMemberRepository,
    @Inject(ITestTakerRepository)
    private readonly testTakerRepository: ITestTakerRepository,
    @Inject(IBookingRepository)
    private readonly bookingRepository: IBookingRepository,
    @Inject(ISamplingKitInventoryRepository)
    private readonly samplingKitInventoryRepository: ISamplingKitInventoryRepository,
    @Inject(IServiceRepository)
    private readonly serviceRepository: IServiceRepository,
  ) {}

  private mapToResponseDto(caseMember: CaseMember): CaseMemberResponseDto {
    return new CaseMemberResponseDto({
      _id: caseMember._id,
      testTaker: caseMember.testTaker,
      booking: caseMember.booking,
      service: caseMember.service,
    })
  }

  private checkAnyServiceIsAdministration = async (
    serviceIds: string[],
  ): Promise<boolean> => {
    // Lặp qua từng ID trong mảng
    for (const serviceId of serviceIds) {
      const isAdmin =
        await this.serviceRepository.checkIsAdministration(serviceId)
      // Nếu tìm thấy BẤT KỲ dịch vụ nào là hành chính, trả về true ngay lập tức
      if (isAdmin) {
        return true
      }
    }
    // Nếu vòng lặp kết thúc mà không tìm thấy, có nghĩa là không có cái nào
    return false
  }

  async findAllCaseMembers(
    pageNumber: number,
    pageSize: number,
    userId?: string,
  ): Promise<PaginatedResponse<CaseMemberResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    if (pageNumber < 1 || pageSize < 1) {
      throw new ConflictException('Số trang và kích thước trang phải lớn hơn 0')
    }
    let filter: Record<string, any>
    if (userId === undefined || userId === null) {
      filter = {}
    } else {
      filter = { created_by: userId }
    }

    // Fetch users and total count in parallel
    const [users, totalItems] = await Promise.all([
      this.caseMemberRepository
        .findWithQuery(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.caseMemberRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = users.map((caseMember: CaseMember) =>
      this.mapToResponseDto(caseMember),
    ) // Explicitly type `user`
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

  async create(
    dto: CreateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto> {
    // Kiểm tra số lượng thành viên trong nhóm người cần xét nghiệm
    if (dto.testTaker.length <= 1) {
      throw new ConflictException(
        'Hồ sơ nhóm người cần xét nghiệm cần ít nhất 2 thành viên',
      )
    }

    if (dto.testTaker.length >= 3) {
      throw new ConflictException(
        'Một hồ sơ nhóm người cần xét nghiệm chỉ có tối đa 2 thành viên',
      )
    }

    // Kiểm tra lịch hẹn có tồn tại không
    const bookingExist = await this.bookingRepository.checkExistById(
      dto.booking,
    )

    if (!bookingExist) {
      throw new NotFoundException('Không tìm thấy hồ sơ đặt lịch hẹn')
    }

    // Kiểm tra ngày giờ của lịch hẹn
    const bookingExistDate = await this.bookingRepository.getBookingDateById(
      dto.booking,
    )
    if (new Date(bookingExistDate) < new Date()) {
      throw new ConflictException('Lịch hẹn đã qua thời gian sử dụng')
    }

    // Lấy cơ sở từ lịch hẹn
    const facilityId = await this.bookingRepository.getFacilityIdByBookingId(
      dto.booking,
    )

    // Kiểm tra xem dịch vụ có tồn tại không
    const service = await this.serviceRepository.findByIds(dto.service)

    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ')
    }

    // Kiểm tra xem dịch vụ này có được sử dụng tại nhà không
    const isServiceNotAtHome = await this.checkAnyServiceIsAdministration(
      dto.service,
    )
    if (isServiceNotAtHome === true && dto.isAtHome === true) {
      throw new ConflictException('Dịch vụ này không được sử dụng tại nhà')
    }
    if (isServiceNotAtHome === true && dto.isSelfSampling === true) {
      throw new ConflictException('Dịch vụ này không được sử dụng tại nhà')
    }
    // Lấy sample để tìm sampling kit
    const sampleIds = await this.serviceRepository.getSampleIds(dto.service)

    let quantityNeeded: number
    let findSamplingKitInventory: string[] | null
    const isSingleService = dto.isSingleService
    if (isSingleService) {
      // TRƯỜNG HỢP 1: Mỗi người dùng 1 dịch vụ

      // Logic yêu cầu số lượng dịch vụ phải bằng số lượng người xét nghiệm
      if (sampleIds.length !== dto.testTaker.length) {
        throw new BadRequestException(
          'Số lượng dịch vụ phải bằng số lượng người xét nghiệm.',
        )
      }

      // Mỗi dịch vụ chỉ cần 1 kit
      quantityNeeded = 1

      // Tìm các kit, đảm bảo mỗi loại đều có đủ hàng
      findSamplingKitInventory =
        await this.samplingKitInventoryRepository.findBySampleIdAndQuantityInFacility(
          sampleIds,
          quantityNeeded,
          facilityId,
        )

      // Nếu số lượng kit tìm thấy không khớp, tức là có loại kit đã hết hàng
      if (findSamplingKitInventory.length !== sampleIds.length) {
        throw new NotFoundException(
          'Một hoặc nhiều mẫu kit xét nghiệm không đủ trong kho.',
        )
      }
    } else {
      // TRƯỜNG HỢP 2: Tất cả mọi người cùng dùng chung các dịch vụ

      // Số lượng cần cho mỗi loại kit là tổng số người xét nghiệm
      quantityNeeded = dto.testTaker.length

      // Tìm các kit, đảm bảo mỗi loại đều có đủ hàng cho tất cả mọi người
      findSamplingKitInventory =
        await this.samplingKitInventoryRepository.findBySampleIdAndQuantityInFacility(
          sampleIds,
          quantityNeeded,
          facilityId,
        )

      // Nếu số lượng kit tìm thấy không khớp, tức là có loại kit đã hết hàng
      if (findSamplingKitInventory.length !== sampleIds.length) {
        throw new NotFoundException(
          'Một hoặc nhiều mẫu kit xét nghiệm không đủ trong kho cho tất cả mọi người.',
        )
      }
    }

    // --- BƯỚC 2: CẬP NHẬT SỐ LƯỢNG TỒN KHO ---

    // Cập nhật số lượng cho tất cả các kit đã tìm thấy ở trên
    await this.samplingKitInventoryRepository.updateInventory(
      findSamplingKitInventory,
      facilityId,
      quantityNeeded, // Dùng số lượng đã được xác định ở bước 1
    )

    // --- BƯỚC 3: TẠO HỒ SƠ ---

    // Tạo hồ sơ nhóm người cần xét nghiệm
    const dataSend = {
      ...dto,
      samplingKitInventory: findSamplingKitInventory,
    }
    const caseMember = await this.caseMemberRepository.create(dataSend, userId)
    return this.mapToResponseDto(caseMember)
  }

  async findById(id: string): Promise<CaseMemberResponseDto | null> {
    try {
      const caseMember = await this.caseMemberRepository.findById(id)
      if (!caseMember) {
        return null
      }
      return this.mapToResponseDto(caseMember)
    } catch (error) {
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new NotFoundException('ID không hợp lệ')
      }
      console.error('Error finding case member:', error)
    }
  }
}
