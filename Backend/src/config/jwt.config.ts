import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'

export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule], // Đảm bảo ConfigModule đã được import (thường là global trong AppModule)
  inject: [ConfigService], // Tiêm ConfigService vào factory
  useFactory: (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '7d' },
  }),
})
