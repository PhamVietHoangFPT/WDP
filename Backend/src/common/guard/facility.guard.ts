import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { Observable } from 'rxjs'

interface UserPayload {
  // Các trường khác trong payload JWT của bạn
  userId: string
  name: string
  role: string
  facility: {
    _id: string
  }
  // ... các trường khác như roles
}

@Injectable()
export class FacilityAccessGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as UserPayload // Lấy user từ request (đã được JwtAuthGuard xử lý)

    if (!user) {
      // Trường hợp này không nên xảy ra nếu JwtAuthGuard được áp dụng trước
      throw new ForbiddenException(
        'Quyền truy cập bị từ chối: Người dùng không hợp lệ.',
      )
    }

    // Lấy facilityId từ JWT của người dùng
    const userFacilityAccess = user.facility._id

    if (!userFacilityAccess) {
      throw new ForbiddenException(
        'Quyền truy cập bị từ chối: Người dùng không được liên kết với bất kỳ cơ sở nào.',
      )
    }

    return true // Cho phép truy cập nếu tất cả điều kiện đều thỏa mãn
  }
}
