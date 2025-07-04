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
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    MongooseModule.forFeature([
      { name: Facility.name, schema: FacilitySchema },
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
