import {
  Injectable,
  Inject,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  HttpException,
} from '@nestjs/common'
import { Types } from 'mongoose'

import { IAccountsRepository } from './interfaces/iaccount.repository'
import { IAccountsService } from './interfaces/iaccount.service'
import { CreateAccountDto } from './dto/create-account.dto'
import { AccountResponseDto } from './dto/account-response.dto'
import { Account } from './schemas/account.schema'
import { PaginatedResponse } from 'src/common/interfaces/paginated-response.interface'
import { hashPassword } from 'src/utils/hashPassword'

@Injectable()
export class AccountsService implements IAccountsService {
  constructor(
    @Inject(IAccountsRepository)
    private readonly accountsRepository: IAccountsRepository, // <-- Thay đổi cách inject
  ) {}

  private mapToResponseDto(user: Account): AccountResponseDto {
    return new AccountResponseDto({
      _id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,

      role: user.role,
      facility: user.facility,
    })
  }

  async createAccount(
    createUserDto: CreateAccountDto,
  ): Promise<AccountResponseDto> {
    const { email, password, name, role, facility, phoneNumber, gender } =
      createUserDto

    const existingUser = await this.accountsRepository.findByEmail(email)
    if (existingUser) {
      throw new ConflictException(`Email "${email}" đã được sử dụng.`)
    }

    const existingPhoneNumber =
      await this.accountsRepository.findByPhoneNumber(phoneNumber)
    if (existingPhoneNumber) {
      throw new ConflictException(
        `Số điện thoại "${phoneNumber}" đã được sử dụng.`,
      )
    }

    const passwordHash = await hashPassword(password)
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const roleId = role.toString()

    let roleObjectId: Types.ObjectId
    try {
      if (!role) {
        // Kiểm tra nếu role là null, undefined hoặc chuỗi rỗng từ DTO
        throw new Error('ID vai trò là bắt buộc và không được để trống.')
      }
      roleObjectId = new Types.ObjectId(roleId) // Chuyển string 'role' thành ObjectId
    } catch (error) {
      console.error(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        `Lỗi khi chuyển đổi role ID: "${role}" thành ObjectId.`,
        error,
      )
      // Ném lỗi rõ ràng cho client biết ID không hợp lệ
      throw new BadRequestException(
        // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
        `ID vai trò không hợp lệ: "${role}". Nó phải là một chuỗi 24 ký tự hexa.`,
      )
    }

    let facilityObjectId: Types.ObjectId | null

    if (facility) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const facilityId = facility.toString() // Chuyển đổi thành chuỗi
        facilityObjectId = new Types.ObjectId(facilityId)
      } catch (error) {
        console.error(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          `Lỗi khi chuyển đổi facility ID: "${facility}" thành ObjectId.`,
          error,
        )
        throw new BadRequestException(
          // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
          `ID cơ sở không hợp lệ: "${facility}". Nó phải là một chuỗi 24 ký tự hexa.`,
        )
      }
    } else {
      facilityObjectId = null
    }

    try {
      const newUser = await this.accountsRepository.create({
        name: name,
        email: email,
        password: passwordHash,
        phoneNumber: phoneNumber,
        gender: gender,
        role: roleObjectId as any,
        facility: facilityObjectId as any,
      })

      return this.mapToResponseDto(newUser)
    } catch (error) {
      console.error('Error creating user:', error)
      throw new InternalServerErrorException('Không thể tạo người dùng.')
    }
  }

  async findAllAccounts(
    pageNumber: number,
    pageSize: number,
  ): Promise<PaginatedResponse<AccountResponseDto>> {
    const skip = (pageNumber - 1) * pageSize
    const filter = {}
    // Fetch users and total count in parallel
    const [users, totalItems] = await Promise.all([
      this.accountsRepository
        .findWithQuery(filter) // Returns a query object
        .skip(skip)
        .limit(pageSize)
        .exec(), // Execute the query
      this.accountsRepository.countDocuments(filter), // Use repository for count
    ])

    const totalPages = Math.ceil(totalItems / pageSize)
    const data = users.map((user: Account) => this.mapToResponseDto(user)) // Explicitly type `user`
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

  async findAccountById(id: string): Promise<AccountResponseDto> {
    const user = await this.accountsRepository.findById(id) // Sử dụng repo đã inject
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID "${id}".`)
    }
    return this.mapToResponseDto(user)
  }

  // async updateUser(
  //   id: string,
  //   updateUserDto: Partial<UpdateUserDto>,
  // ): Promise<UserResponseDto> {
  //   const userToUpdate = { ...updateUserDto };
  //   delete userToUpdate.password;

  //   const updatedUser = await this.accountsRepository.update(id, userToUpdate); // Sử dụng repo đã inject
  //   if (!updatedUser) {
  //     throw new NotFoundException(
  //       `Không tìm thấy người dùng với ID "${id}" để cập nhật.`,
  //     );
  //   }
  //   return this.mapToResponseDto(updatedUser);
  // }

  // ... trong class AccountsService

  async deleteAccount(id: string): Promise<void> {
    try {
      const deleteResult = await this.accountsRepository.delete(id)

      if (!deleteResult) {
        throw new NotFoundException(
          `Không tìm thấy người dùng với ID "${id}" để xóa.`,
        )
      }
      // Nếu affected > 0, nghĩa là xóa thành công, không cần làm gì thêm trong try
    } catch (error) {
      // Kiểm tra xem lỗi có phải là HttpException (như NotFoundException) không
      if (error instanceof HttpException) {
        // Nếu đúng, ném lại chính lỗi đó để NestJS xử lý (trả về 404, 400, ...)
        throw error
      }

      // Nếu là lỗi khác (lỗi CSDL, lỗi không mong đợi)
      console.error(`Lỗi không mong đợi khi xóa tài khoản ID ${id}:`, error) // Log lỗi ra để debug
      // Ném lỗi 500 chung chung
      throw new InternalServerErrorException(
        'Đã xảy ra lỗi không mong đợi khi xóa tài khoản.',
      )
    }
  }
}
