import {
  Injectable,
  // Inject,
  // ConflictException,
  NotFoundException,
  // InternalServerErrorException,
  HttpException,
  Inject,
  HttpStatus,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'

import { IAuthRepository } from './interfaces/iauth.repository'
import { LoginDto } from './dto/login.dto'
import { LoginResponseDto } from './dto/loginResponse.dto'
import { ConfigService } from '@nestjs/config'
// import { hashPassword } from 'src/utils/hashPassword'
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
  ) {}

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateToken(payload: any): Promise<string> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET')
    return Promise.resolve(this.jwtService.sign(payload, { secret: jwtSecret }))
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET')
      const payload = await this.jwtService.verify(token, { secret: jwtSecret })
      return payload
    } catch (error) {
      throw new HttpException('Token không hợp lệ', 401)
    }
  }

  decodeToken(token: string): Promise<any> {
    return this.jwtService.decode(token)
  }

  async getTokenPayload(token: string): Promise<any> {
    const decoded = await this.decodeToken(token)
    return decoded
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
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
      throw new HttpException('Sai mật khẩu', HttpStatus.BAD_REQUEST)
    }

    const token = await this.generateToken({
      id: account._id,
      email: account.email,
      name: account.name,
      phoneNumber: account.phoneNumber,
      role: account.role.role,
      facility: account.facility,
      gender: account.gender,
    })

    return new LoginResponseDto({
      accessToken: token,
    })
  }
}
