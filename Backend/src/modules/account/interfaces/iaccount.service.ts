import { CreateAccountDto } from '../dto/create-account.dto'
import { AccountResponseDto } from '../dto/account-response.dto'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
// Interface định nghĩa các phương thức mà Service phải có
export interface IAccountsService {
  createAccount(createAccountDto: CreateAccountDto): Promise<AccountResponseDto>
  findAllAccounts(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<AccountResponseDto>>

  findAccountById(id: string): Promise<AccountResponseDto> // Có thể throw lỗi nếu không tìm thấy
  // updateAccount(
  //   id: string,
  //   updateAccountDto: Partial<UpdateAccountDto>,
  // ): Promise<AccountResponseDto>; // Có thể throw lỗi
  deleteAccount(id: string): Promise<void> // Có thể throw lỗi
}

// Định nghĩa Injection Token cho Service Interface
export const IAccountsService = Symbol('IAccountsService')
