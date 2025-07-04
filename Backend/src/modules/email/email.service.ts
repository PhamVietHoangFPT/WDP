// src/email/email.service.ts
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { IEmailService } from './interfaces/iemail.service'
import { InjectModel } from '@nestjs/mongoose'
import { Account } from '../account/schemas/account.schema'
import { Model } from 'mongoose'
import { Facility } from '../facility/schemas/facility.schema'

@Injectable()
export class EmailService implements IEmailService {
  constructor(
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    @InjectModel(Account.name)
    private readonly accountModel: Model<Account>,
    @InjectModel(Facility.name)
    private readonly facilityModel: Model<Facility>,
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
  }

  async sendEmailForResult(
    customerId: string,
    adnPercentage: string,
    doctorId: string,
    conclusion: string,
  ): Promise<void> {
    const doctorAccount = await this.accountModel
      .findOne({ _id: doctorId })
      .select('name facility -_id')
      .exec()
    const customerAccount = await this.accountModel
      .findOne({
        _id: customerId,
      })
      .select('email name -_id')
      .exec()
    const facility = await this.facilityModel
      .findOne({ _id: doctorAccount.facility })
      .select('facilityName -_id')
      .exec()
    await this.mailerService.sendMail({
      to: customerAccount.email,
      subject: 'Kết quả của bạn',
      template: 'adn-result', // Tên file template (ví dụ: result.hbs)
      context: {
        message: 'Đây là kết quả của bạn từ hệ thống.',
        appName: this.APP_NAME,
        customerName: customerAccount.name,
        doctorName: doctorAccount
          ? doctorAccount.name
          : 'Bác sĩ không xác định',
        facilityName: facility ? facility.facilityName : 'Cơ sở không xác định',
        adnPercentage: adnPercentage,
        conclusion: conclusion,
        currentYear: new Date().getFullYear(),
      },
    })
    console.log(`Email kết quả đã được gửi đến ${customerAccount.email}`)
  }

  // Thêm các phương thức gửi email khác tùy theo nhu cầu
}
