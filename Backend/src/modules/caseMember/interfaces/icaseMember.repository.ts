import { CaseMemberDocument } from '../schemas/caseMember.schema'
import { UpdateCaseMemberDto } from '../dto/updateCaseMember.dto'
import { CreateCaseMemberDto } from '../dto/createCaseMember.dto'
import mongoose from 'mongoose'

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
  findWithQuery(
    filter: Record<string, any>,
  ): mongoose.Query<CaseMemberDocument[], CaseMemberDocument>
  countDocuments(filter: Record<string, unknown>): Promise<number>
  getBookingIdByCaseMemberId(caseMemberId: string): Promise<string>
  getSamplingKitInventoryIdByCaseMemberId(caseMemberId: string): Promise<string>
  getIsAtHome(caseMemberId: string): Promise<boolean | null>
}

export const ICaseMemberRepository = Symbol('ICaseMemberRepository')
