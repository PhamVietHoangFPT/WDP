// src/common/guards/auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'
import { AuthService } from '../../modules/auth/auth.service'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization token')
    }

    const token = authHeader.split(' ')[1]

    try {
      const userPayload = await this.authService.verifyToken(token)
      request.user = userPayload // Gắn user vào request
      return true
    } catch (error: any) {
      throw new UnauthorizedException(error.message || 'Invalid token')
    }
  }
}
