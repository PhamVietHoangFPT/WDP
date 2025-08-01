import { CreateCaseMemberDto } from '../dto/createCaseMember.dto'
import { CaseMemberResponseDto } from '../dto/caseMemberResponse.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'

export interface ICaseMemberService {
  create(
    dto: CreateCaseMemberDto,
    userId: string,
  ): Promise<CaseMemberResponseDto>
  findById(id: string): Promise<CaseMemberResponseDto | null>
  findAllCaseMembers(
    pageNumber: number,
    pageSize: number,
    userId?: string,
  ): Promise<PaginatedResponse<CaseMemberResponseDto>>
}

export const ICaseMemberService = Symbol('ICaseMemberService')
