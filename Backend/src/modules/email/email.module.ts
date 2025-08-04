import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { EmailService } from './email.service'
import { join } from 'path'
import { ConfigModule, ConfigService } from '@nestjs/config' // Import ConfigModule, ConfigService
import { IEmailService } from './interfaces/iemail.service' // Import interface for EmailService
import { MongooseModule } from '@nestjs/mongoose'
import { Account, AccountSchema } from '../account/schemas/account.schema'
import { Facility, FacilitySchema } from '../facility/schemas/facility.schema'
import { Booking, BookingSchema } from '../booking/schemas/booking.schema'
import {
  AdnDocumentation,
  AdnDocumentationSchema,
} from '../adnDocumentation/schemas/adnDocumentation.schema'
@Module({
  imports: [
    ConfigModule, // Đảm bảo ConfigModule đã được import
    MailerModule.forRootAsync({
      // Sử dụng forRootAsync để lấy config từ ConfigService
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_APP_PASSWORD'),
          },
        },
        defaults: {
          from: `"${configService.get<string>('APP_NAME') || 'No Reply'}" <${configService.get<string>('EMAIL_USER')}>`,
        },
        template: {
          dir: join(__dirname, 'emailTemplates'),
          adapter: new HandlebarsAdapter({
            // ✨ BẮT ĐẦU THÊM VÀO ĐÂY
            join: function (arr, sep) {
              if (Array.isArray(arr)) {
                return arr.join(sep)
              }
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return arr // Trả về giá trị gốc nếu không phải mảng
            },
          }),
          options: {
            strict: true,
          },
        },
      }),
    }),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Facility.name, schema: FacilitySchema },
      { name: Booking.name, schema: BookingSchema },
      { name: AdnDocumentation.name, schema: AdnDocumentationSchema },
    ]),
  ],
  providers: [
    {
      provide: IEmailService,
      useClass: EmailService,
    },
  ],
  exports: [IEmailService],
})
export class EmailModule {}
