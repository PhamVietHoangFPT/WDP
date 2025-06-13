import { CaseMemberDocument } from '../schemas/caseMember.schema'
import { UpdateCaseMemberDto } from '../dto/updateCaseMember.dto'
import { CreateCaseMemberDto } from '../dto/createCaseMember.dto'

export interface ICaseMemberRepository {
  create(dto: CreateCaseMemberDto, userId: string): Promise<CaseMemberDocument>
  update(
    id: string,
    dto: UpdateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberDocument>
  countMemberInCase(id: string): Promise<number>
  addMember(
    caseMemberId: string,
    testTakerId: string,
    userId: string,
  ): Promise<CaseMemberDocument | null>
  findById(id: string): Promise<CaseMemberDocument | null>
  checkBookingUsed(bookingId: string): Promise<boolean>
}

export const ICaseMemberRepository = Symbol('ICaseMemberRepository')
