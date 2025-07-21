// Trong vnpay.module.ts
import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config' // Import ConfigModule và ConfigService
import { VnpayModule as VnPayModuleLocal } from 'nestjs-vnpay'
import { HashAlgorithm, ignoreLogger } from 'vnpay'
import { VnpayController } from './vnpay.controller'
import { VnpayService } from './vnpay.service' // Giả sử bạn vẫn cần VnpayService tùy chỉnh
import { ServiceCaseModule } from '../serviceCase/serviceCase.module'

@Module({
  imports: [
    // Đảm bảo ConfigModule được import ở đây hoặc isGlobal: true ở AppModule
    // ConfigModule.forRoot(), // Nếu chưa global
    VnPayModuleLocal.registerAsync({
      // imports: [ConfigModule], // Import ConfigModule nếu nó không global
      useFactory: (configService: ConfigService) => ({
        tmnCode: configService.get<string>('VNP_TMNCODE'),
        secureSecret: configService.get<string>('VNP_HASHSECRET'),
        vnpayHost: configService.get<string>(
          'VNP_HOST',
          'https://sandbox.vnpayment.vn',
        ), // Có thể đặt default
        testMode: configService.get<boolean>('VNP_TEST_MODE', true),
        hashAlgorithm: HashAlgorithm.SHA512, // VNPAY khuyến nghị SHA512
        enableLog: true,
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
    ServiceCaseModule,
  ],
  controllers: [VnpayController],
  providers: [VnpayService], // Vẫn giữ VnpayService của bạn nếu nó làm các việc khác ngoài cấu hình client
  exports: [VnPayModuleLocal, VnpayService],
})
export class VnPayModule { }
