import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  ClassSerializerInterceptor,
  Inject,
} from '@nestjs/common'

import { IAuthService } from './interfaces/iauth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { LoginResponseDto } from './dto/login-response.dto'
import { RegisterResponseDto } from './dto/register-response.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    @Inject(IAuthService) // Ensure the correct token is used
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ApiResponseDto<LoginResponseDto>,
  })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ValidationPipe()) loginDto: LoginDto,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const loginData = await this.authService.login(loginDto)
    return new ApiResponseDto<LoginResponseDto>({
      data: [loginData],
      success: true,
      message: 'Đăng nhập thành công',
    })
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ApiResponseDto<RegisterResponseDto>,
  })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ValidationPipe()) registerDto: RegisterDto,
  ): Promise<ApiResponseDto<RegisterResponseDto>> {
    const registerData = await Promise.resolve(
      this.authService.register(registerDto),
    )
    return new ApiResponseDto<RegisterResponseDto>({
      data: [registerData],
      success: true,
      message: 'Đăng ký thành công',
    })
  }
}
