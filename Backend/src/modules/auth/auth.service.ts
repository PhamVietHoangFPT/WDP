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
import { RegisterDto } from './dto/register.dto'
import { RegisterResponseDto } from './dto/registerResponse.dto'
import { hashPassword } from 'src/utils/hashPassword'
import { IRoleRepository } from '../role/interfaces/irole.repository'
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @Inject(IAuthRepository) private readonly authRepository: IAuthRepository,
    @Inject(IRoleRepository) private readonly roleRepository: IRoleRepository,
  ) {}

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  }

  private generateToken(payload: any): Promise<string> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET')
    return Promise.resolve(this.jwtService.sign(payload, { secret: jwtSecret }))
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET')
      const payload = await this.jwtService.verify(token, { secret: jwtSecret })
      return payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new HttpException('Token không hợp lệ', 401)
    }
  }

  private decodeToken(token: string): Promise<any> {
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

    if (account.deleted_at) {
      throw new HttpException('Tài khoản đã bị xóa', HttpStatus.BAD_REQUEST)
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

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // 1. Lấy email và password từ DTO để dễ sử dụng
    const { email } = registerDto

    let password = registerDto.password

    const roleId = await this.roleRepository.getRoleIdByName('Customer')

    if (!roleId) {
      throw new NotFoundException('Role "Customer" không tồn tại')
    }

    // 2. Kiểm tra xem email đã tồn tại chưa
    const existingAccount = await this.authRepository
      .loginByEmail(email.toLowerCase())
      .exec()
    if (existingAccount) {
      throw new HttpException('Email đã được sử dụng', HttpStatus.CONFLICT)
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await hashPassword(password)
    password = hashedPassword
    const sendData = {
      name: registerDto.name,
      phoneNumber: registerDto.phoneNumber,
      gender: registerDto.gender,
      password: password,
      email: email.toLowerCase(),
    }

    // 4. Gọi hàm repository đã sửa ở trên để tạo tài khoản mới
    const newAccount = await this.authRepository.createAccount(sendData, roleId)

    if (!newAccount) {
      throw new HttpException(
        'Đăng ký không thành công, vui lòng thử lại',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }

    // 6. Trả về kết quả thành công
    return new RegisterResponseDto({
      name: newAccount.name,
      email: newAccount.email,
    })
  }
}
