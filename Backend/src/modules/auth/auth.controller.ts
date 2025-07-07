import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Inject,
} from '@nestjs/common'

import { IAuthService } from './interfaces/iauth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { LoginResponseDto } from './dto/loginResponse.dto'
import { RegisterResponseDto } from './dto/registerResponse.dto'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { ApiResponseDto } from 'src/common/dto/api-response.dto'
import { IEmailService } from '../email/interfaces/iemail.service'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(IAuthService) // Ensure the correct token is used
    private readonly authService: IAuthService,
    @Inject(IEmailService)
    private readonly emailService: IEmailService, // Inject the email service
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

  // @Post('test-email')
  // @ApiOperation({ summary: 'Kiểm tra email' })
  // @ApiResponse({
  //   status: HttpStatus.OK,
  //   type: ApiResponseDto<string>,
  // })
  // @HttpCode(HttpStatus.OK)
  // async testEmail() {
  //   return this.emailService.sendEmailNotificationForCheckIn(
  //     '6867e821af7e375eba8ed5b4',
  //     '686bc26ae6d7e74b2a4958f7',
  //   )
  // }
}
