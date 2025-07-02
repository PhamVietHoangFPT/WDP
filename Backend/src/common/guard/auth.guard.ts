// src/common/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common'
import { IAuthService } from 'src/modules/auth/interfaces/iauth.service'
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(IAuthService) private readonly authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Chưa có token xác thực')
    }

    const token = authHeader.split(' ')[1]

    try {
      const userPayload = await this.authService.verifyToken(token)
      request.user = userPayload // Gắn user vào request
      return true
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Token không hợp lệ')
    }
  }
}
