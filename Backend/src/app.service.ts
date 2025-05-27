import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Tôi yêu FPTU - Tôi yêu lập trình - Tôi yêu công nghệ - Tôi yêu cuộc sống'
  }
}
