import { LoginDto } from '../dto/login.dto'
import { LoginResponseDto } from '../dto/loginResponse.dto'
import { RegisterResponseDto } from '../dto/registerResponse.dto'
import { RegisterDto } from '../dto/register.dto'
export interface IAuthService {
  login(loginDto: LoginDto): Promise<LoginResponseDto>
  logout(): Promise<void>
  refreshToken(token: string): Promise<LoginResponseDto | null>
  verifyToken(token: string): Promise<boolean>
  register(registerDto: RegisterDto): RegisterResponseDto
}

export const IAuthService = Symbol('IAuthService')
