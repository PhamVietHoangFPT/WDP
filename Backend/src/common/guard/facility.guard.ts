import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { Observable } from 'rxjs'

interface UserPayload {
  // Các trường khác trong payload JWT của bạn
  userId: string
  name: string
  role: string
  facility: {
    id: string
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
    const userFacilityAccess = user.facility.id

    if (!userFacilityAccess) {
      throw new ForbiddenException(
        'Quyền truy cập bị từ chối: Người dùng không được liên kết với bất kỳ cơ sở nào.',
      )
    }

    // Lấy facilityId từ request (ví dụ: params, body, hoặc query)
    // Bạn cần điều chỉnh logic này tùy theo cách bạn thiết kế API
    let requestedFacilityId: string | undefined

    if (request.params && request.params.facilityId) {
      requestedFacilityId = request.params.facilityId
    } else if (request.body && request.body.facilityId) {
      requestedFacilityId = request.body.facilityId
    } else if (request.query && request.query.facilityId) {
      requestedFacilityId = request.query.facilityId
    }
    // Bạn có thể thêm các key khác nếu cần, ví dụ: request.params.id nếu id đó là facilityId

    if (!requestedFacilityId) {
      // Nếu không có facilityId trong request để so sánh, có thể là lỗi logic hoặc API không yêu cầu
      // Tùy trường hợp, bạn có thể cho phép hoặc từ chối.
      // Ở đây, ví dụ là yêu cầu phải có facilityId trong request để kiểm tra.
      throw new BadRequestException(
        'Quyền truy cập bị từ chối: Không tìm thấy facilityId trong request.',
      )
    }

    // So sánh
    let hasAccess = false
    if (Array.isArray(userFacilityAccess)) {
      // Nếu người dùng có quyền truy cập nhiều cơ sở
      if (userFacilityAccess.includes(requestedFacilityId)) {
        hasAccess = true
      }
    } else {
      // Nếu người dùng chỉ có quyền truy cập một cơ sở
      if (userFacilityAccess === requestedFacilityId) {
        hasAccess = true
      }
    }

    if (!hasAccess) {
      throw new ForbiddenException(
        `Quyền truy cập bị từ chối: Bạn không có quyền truy cập vào cơ sở '${requestedFacilityId}'.`,
      )
    }

    return true // Cho phép truy cập nếu tất cả điều kiện đều thỏa mãn
  }
}
