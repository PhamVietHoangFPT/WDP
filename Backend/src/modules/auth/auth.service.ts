import {
  Injectable,
  // Inject,
  // ConflictException,
  NotFoundException,
  // InternalServerErrorException,
  HttpException,
  Inject,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { IAuthRepository } from './interfaces/iauth.repository'
import { LoginDto } from './dto/login.dto'
import { LoginResponseDto } from './dto/login-response.dto'
// import { hashPassword } from 'src/utils/hashPassword'
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
  ) {}

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateToken(payload: any): Promise<string> {
    return Promise.resolve(this.jwtService.sign(payload))
  }

  verifyToken(token: string): Promise<any> {
    return this.jwtService.verify(token)
  }

  decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token)
  }

  async getTokenPayload(token: string): Promise<any> {
    const decoded = await this.decodeToken(token)
    return decoded
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    try {
      const { email, password } = loginDto

      const account = await this.authRepository.loginByEmail(email).exec()

      if (!account) {
        throw new NotFoundException('Tài khoản không tồn tại')
      }

      const isPasswordValid = await this.comparePassword(
        password,
        account.password,
      )
      if (!isPasswordValid) {
        throw new HttpException('Sai mật khẩu', 401)
      }

      console.log('account', account)

      const token = await this.generateToken({
        id: account._id,
        email: account.email,
        name: account.name,
        phoneNumber: account.phoneNumber,
        role: account.role,
        facility: account.facility,
        gender: account.gender,
      })

      return new LoginResponseDto({
        accessToken: token,
      })
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      } else {
        console.log(error)
        throw new HttpException('Đã xảy ra lỗi trong quá trình đăng nhập', 500)
      }
    }
  }
}
