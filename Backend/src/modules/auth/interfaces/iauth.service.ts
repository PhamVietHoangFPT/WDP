import { LoginDto } from '../dto/login.dto'
import { LoginResponseDto } from '../dto/login-response.dto'
import { RegisterResponseDto } from '../dto/register-response.dto'
import { RegisterDto } from '../dto/register.dto'
export interface IAuthService {
  login(loginDto: LoginDto): Promise<LoginResponseDto>
  logout(): Promise<void>
  refreshToken(token: string): Promise<LoginResponseDto | null>
  verifyToken(token: string): Promise<boolean>
  register(registerDto: RegisterDto): RegisterResponseDto
}

export const IAuthService = Symbol('IAuthService')
