// src/email/email.service.ts
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IEmailService } from './interfaces/iemail.service'

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  APP_NAME = this.configService.get<string>('APP_NAME')

  async sendUserWelcomeEmail(email: string, name: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email, // Địa chỉ người nhận
      from: 'noreply@example.com', // Hoặc dùng default 'from' đã cấu hình
      subject: 'Chào mừng bạn đến với ứng dụng của chúng tôi!', // Tiêu đề email
      template: 'welcome', // Tên file template (ví dụ: welcome.hbs) trong thư mục 'templates'
      context: {
        // Dữ liệu sẽ được truyền vào template
        name: name,
        appName: this.APP_NAME,
      },
    })
    console.log(`Email chào mừng đã được gửi đến ${email}`)
  }

  async sendPasswordResetEmail(
    email: string,
    resetLink: string,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Yêu cầu đặt lại mật khẩu của bạn',
      template: 'password-reset', // Tên file template (ví dụ: password-reset.hbs)
      context: {
        resetLink: resetLink,
        appName: this.APP_NAME,
      },
    })
    console.log(`Email đặt lại mật khẩu đã được gửi đến ${email}`)
  }

  async testEmail(email: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Kiểm tra email',
      template: 'test-email', // Tên file template (ví dụ: test-email.hbs)
      context: {
        message: 'Đây là một email kiểm tra từ hệ thống của chúng tôi.',
        appName: this.APP_NAME,
      },
    })
    console.log(`Email kiểm tra đã được gửi đến ${email}`)
  }

  // Thêm các phương thức gửi email khác tùy theo nhu cầu
}
