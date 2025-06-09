import { Injectable, NotFoundException, Inject } from '@nestjs/common'
import { CaseMember, CaseMemberDocument } from './schemas/caseMember.schema'
import { ICaseMemberRepository } from './interfaces/icaseMember.repository'
import { ICaseMemberService } from './interfaces/icaseMember.service'
import { CreateCaseMemberDto } from './dto/createCaseMember.dto'
import { UpdateCaseMemberDto } from './dto/updateCaseMember.dto'
import { CaseMemberResponseDto } from './dto/caseMemberResponse.dto'
import { ITestTakerRepository } from '../testTaker/interfaces/itestTaker.repository'

@Injectable()
export class CaseMemberService implements ICaseMemberService {
  constructor(
    @Inject(ICaseMemberRepository)
    private readonly caseMemberRepository: ICaseMemberRepository,
    @Inject(ITestTakerRepository)
    private readonly testTakerRepository: ITestTakerRepository,
  ) {}

  private mapToResponseDto(caseMember: CaseMember): CaseMemberResponseDto {
    return new CaseMemberResponseDto(caseMember)
  }

  async create(
    dto: CreateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto> {
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
      throw new NotFoundException('Case member not found')
    }
    return this.mapToResponseDto(caseMember)
  }
  async findById(id: string): Promise<CaseMemberResponseDto | null> {
    const caseMember = await this.caseMemberRepository.findById(id)
    if (!caseMember) {
      throw new NotFoundException(
        `Không tìm thấy hồ sơ nhóm người cần xét nghiệm với ID ${id}`,
      )
    }
    return this.mapToResponseDto(caseMember)
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
