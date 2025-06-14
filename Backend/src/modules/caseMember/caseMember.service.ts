import {
  Injectable,
  NotFoundException,
  Inject,
  ConflictException,
} from '@nestjs/common'
import { CaseMember, CaseMemberDocument } from './schemas/caseMember.schema'
import { ICaseMemberRepository } from './interfaces/icaseMember.repository'
import { ICaseMemberService } from './interfaces/icaseMember.service'
import { CreateCaseMemberDto } from './dto/createCaseMember.dto'
import { UpdateCaseMemberDto } from './dto/updateCaseMember.dto'
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

    if (dto.testTaker.length > 3) {
      throw new ConflictException(
        'Một hồ sơ nhóm người cần xét nghiệm chỉ có tối đa 3 thành viên',
      )
    }

    // Kiểm tra lịch hẹn có tồn tại không
    const bookingExist = await this.bookingRepository.checkExistById(
      dto.booking,
    )

    if (!bookingExist) {
      throw new NotFoundException('Không tìm thấy hồ sơ đặt lịch hẹn')
    }

    // Kiểm tra lịch hẹn đã được sử dụng chưa
    const isBookingUsed = await this.caseMemberRepository.checkBookingUsed(
      dto.booking,
    )

    if (isBookingUsed) {
      throw new ConflictException(
        'Lịch hẹn này đã được sử dụng cho một hồ sơ nhóm người cần xét nghiệm khác',
      )
    }

    // Kiểm tra trạng thái của lịch hẹn
    const bookingStatus = await this.bookingRepository.getBookingStatusById(
      dto.booking,
    )
    if (!bookingStatus) {
      throw new NotFoundException('Không tìm thấy hồ sơ đặt lịch hẹn')
    }
    if (bookingStatus.bookingStatus !== 'Thành công') {
      throw new ConflictException(
        'Hồ sơ đặt lịch hẹn ' +
          bookingStatus.bookingStatus.toString().toLocaleLowerCase(),
      )
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
    const service = await this.serviceRepository.findById(dto.service)

    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ')
    }

    // Lấy sample để tìm sampling kit
    const sampleId = await this.serviceRepository.getSampleId(dto.service)

    // Lấy kho mẫu kit xét nghiệm theo sampleId và số lượng trong facility
    const findSamplingKitInventory =
      await this.samplingKitInventoryRepository.findBySampleIdAndQuantityInFacility(
        sampleId.toString(),
        dto.testTaker.length,
        facilityId,
      )

    if (!findSamplingKitInventory) {
      throw new NotFoundException('Mẫu kit xét nghiệm hiện không đủ trong kho')
    }

    // Cập nhật số lượng mẫu kit trong kho
    await this.samplingKitInventoryRepository.updateInventory(
      findSamplingKitInventory,
      facilityId,
      dto.testTaker.length,
    )

    // Tạo hồ sơ nhóm người cần xét nghiệm
    const dataSend = {
      ...dto,
      samplingKitInventory: findSamplingKitInventory,
    }
    const caseMember = await this.caseMemberRepository.create(dataSend, userId)
    return this.mapToResponseDto(caseMember)
  }

  async update(
    id: string,
    dto: UpdateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto> {
    // Kiểm tra số lượng thành viên trong nhóm người cần xét nghiệm
    if (dto.testTaker.length <= 1) {
      throw new ConflictException(
        'Hồ sơ nhóm người cần xét nghiệm cần ít nhất 2 thành viên',
      )
    }

    if (dto.testTaker.length > 3) {
      throw new ConflictException(
        'Một hồ sơ nhóm người cần xét nghiệm chỉ có tối đa 3 thành viên',
      )
    }

    // Kiểm tra lịch hẹn có tồn tại không
    const bookingExist = await this.bookingRepository.checkExistById(
      dto.booking,
    )

    if (!bookingExist) {
      throw new NotFoundException('Không tìm thấy hồ sơ đặt lịch hẹn')
    }

    // Kiểm tra lịch hẹn đã được sử dụng chưa
    const oldBookingUsed =
      await this.caseMemberRepository.getBookingIdByCaseMemberId(id)
    if (oldBookingUsed && oldBookingUsed.toString() !== dto.booking) {
      const isBookingUsed = await this.caseMemberRepository.checkBookingUsed(
        dto.booking,
      )
      if (isBookingUsed) {
        throw new ConflictException(
          'Lịch hẹn này đã được sử dụng cho một hồ sơ nhóm người cần xét nghiệm khác',
        )
      }
    }

    // Kiểm tra trạng thái của lịch hẹn
    const bookingStatus = await this.bookingRepository.getBookingStatusById(
      dto.booking,
    )
    if (!bookingStatus) {
      throw new NotFoundException('Không tìm thấy hồ sơ đặt lịch hẹn')
    }
    if (bookingStatus.bookingStatus !== 'Thành công') {
      throw new ConflictException(
        'Hồ sơ đặt lịch hẹn ' +
          bookingStatus.bookingStatus.toString().toLocaleLowerCase(),
      )
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
    const service = await this.serviceRepository.findById(dto.service)

    if (!service) {
      throw new NotFoundException('Không tìm thấy dịch vụ')
    }

    // Lấy số lượng nhóm người cần xét nghiệm
    const oldCaseMember = await this.caseMemberRepository.findById(id)
    if (!oldCaseMember) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nhóm người cần xét nghiệm',
      )
    }
    const oldTestTakerCount = oldCaseMember.testTaker.length
    // Cập nhật số lượng mẫu kit xét nghiệm

    let numberOfTestTakerToUpdate: number
    let findSamplingKitInventory: string | null
    // Nếu số lượng testTaker không thay đổi, lấy kho mẫu kit xét nghiệm theo caseMemberId
    if (oldTestTakerCount === dto.testTaker.length) {
      numberOfTestTakerToUpdate = 0
      findSamplingKitInventory =
        await this.caseMemberRepository.getSamplingKitInventoryIdByCaseMemberId(
          id,
        )
    } else {
      // Nếu số lượng testTaker thay đổi, tính số lượng cần cập nhật
      numberOfTestTakerToUpdate = dto.testTaker.length - oldTestTakerCount
      // Nếu samplingKit cũ vẫn còn đủ số lượng
      const oldSamplingKitInventory =
        await this.caseMemberRepository.getSamplingKitInventoryIdByCaseMemberId(
          id,
        )
      const oldSamplingKitInventoryDoc =
        await this.samplingKitInventoryRepository.findById(
          oldSamplingKitInventory,
        )
      if (!oldSamplingKitInventoryDoc) {
        throw new NotFoundException('Không tìm thấy kho mẫu kit xét nghiệm')
      }
      if (oldSamplingKitInventoryDoc.inventory >= numberOfTestTakerToUpdate) {
        // Nếu kho mẫu kit xét nghiệm cũ vẫn đủ số lượng, không cần tìm kho mới
        findSamplingKitInventory = oldSamplingKitInventory
        const updateInventory =
          await this.samplingKitInventoryRepository.updateInventory(
            findSamplingKitInventory,
            facilityId,
            numberOfTestTakerToUpdate,
          )
        if (!updateInventory) {
          // Nếu kho mẫu kit xét nghiệm cũ không đủ số lượng, cần tìm kho mới
          // Lấy sample để tìm sampling kit
          const sampleId = await this.serviceRepository.getSampleId(dto.service)
          // Lấy kho mẫu kit xét nghiệm theo sampleId và số lượng trong facility
          findSamplingKitInventory =
            await this.samplingKitInventoryRepository.findBySampleIdAndQuantityInFacility(
              sampleId.toString(),
              numberOfTestTakerToUpdate,
              facilityId,
            )
          if (!findSamplingKitInventory) {
            throw new NotFoundException(
              'Mẫu kit xét nghiệm hiện không đủ trong kho',
            )
          }
          await this.samplingKitInventoryRepository.updateInventory(
            findSamplingKitInventory,
            facilityId,
            numberOfTestTakerToUpdate,
          )
        }
      } else {
        // Nếu kho mẫu kit xét nghiệm cũ không đủ số lượng, cần tìm kho mới
        // Lấy sample để tìm sampling kit
        const sampleId = await this.serviceRepository.getSampleId(dto.service)
        // Lấy kho mẫu kit xét nghiệm theo sampleId và số lượng trong facility
        findSamplingKitInventory =
          await this.samplingKitInventoryRepository.findBySampleIdAndQuantityInFacility(
            sampleId.toString(),
            numberOfTestTakerToUpdate,
            facilityId,
          )
        if (!findSamplingKitInventory) {
          throw new NotFoundException(
            'Mẫu kit xét nghiệm hiện không đủ trong kho',
          )
        }
        await this.samplingKitInventoryRepository.updateInventory(
          findSamplingKitInventory,
          facilityId,
          numberOfTestTakerToUpdate,
        )
      }
    }

    const dataSend = {
      ...dto,
      samplingKitInventory: findSamplingKitInventory,
    }
    const caseMember = await this.caseMemberRepository.update(
      id,
      dataSend,
      userId,
    )
    if (!caseMember) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nhóm người cần xét nghiệm',
      )
    }
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

  async addMember(
    caseMemberId: string,
    testTakerId: string,
    userId: string,
  ): Promise<CaseMemberDocument | null> {
    const testTaker = await this.testTakerRepository.findById(testTakerId)
    if (!testTaker) {
      throw new NotFoundException('Không tìm thấy hồ sơ người cần xét nghiệm')
    }
    const caseMember = await this.caseMemberRepository.findById(caseMemberId)
    if (!caseMember) {
      throw new NotFoundException(
        'Không tìm thấy hồ sơ nhóm người cần xét nghiệm',
      )
    }
    const count =
      await this.caseMemberRepository.countMemberInCase(caseMemberId)
    if (count > 3) {
      throw new NotFoundException(
        'Một hồ sơ nhóm người cần xét nghiệm chỉ có tối đa 3 thành viên',
      )
    }
    return this.caseMemberRepository.addMember(
      caseMemberId,
      testTakerId,
      userId,
    )
  }
}
