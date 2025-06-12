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
import { IBookingStatusRepository } from '../bookingStatus/interfaces/ibookingStatus.repository'
import { IBookingRepository } from '../booking/interfaces/ibooking.repository'

@Injectable()
export class CaseMemberService implements ICaseMemberService {
  constructor(
    @Inject(ICaseMemberRepository)
    private readonly caseMemberRepository: ICaseMemberRepository,
    @Inject(ITestTakerRepository)
    private readonly testTakerRepository: ITestTakerRepository,
    @Inject(IBookingStatusRepository)
    private readonly bookingStatusRepository: IBookingStatusRepository,
    @Inject(IBookingRepository)
    private readonly bookingRepository: IBookingRepository,
  ) {}

  private mapToResponseDto(caseMember: CaseMember): CaseMemberResponseDto {
    return new CaseMemberResponseDto(caseMember)
  }

  async create(
    dto: CreateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto> {
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
    const caseMember = await this.caseMemberRepository.create(dto, userId)
    return this.mapToResponseDto(caseMember)
  }

  async update(
    id: string,
    dto: UpdateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto> {
    const caseMember = await this.caseMemberRepository.update(id, dto, userId)
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
