import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common' // Nên có để validate DTOs
import { ConfigService } from '@nestjs/config'
import * as session from 'express-session'
import { join } from 'node:path'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)
  // (Tùy chọn nhưng khuyến khích) Bật Global Validation Pipe
  // Giúp Swagger hoạt động tốt với các validation decorator trong DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ: string sang number)
    }),
  )

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-very-strong-secret-key', // Rất QUAN TRỌNG: dùng biến môi trường cho secret key ở production
      resave: false, // Không lưu lại session nếu không có thay đổi
      saveUninitialized: false, // Không tạo session cho đến khi có gì đó được lưu
      cookie: {
        // secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS ở production
        httpOnly: true, // Ngăn JavaScript phía client truy cập cookie
        maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie (ví dụ: 1 ngày)
      },
      // store: new RedisStore({ client: redisClient }), // Dùng session store khác cho production (ví dụ Redis, MongoDB)
      // MemoryStore mặc định không phù hợp cho production
    }),
  )
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  })

  // --- Bắt đầu cấu hình Swagger ---
  app.enableCors() // Bật CORS nếu cần thiết, giúp frontend có thể gọi API từ backend
  // Tạo một đối tượng cấu hình cơ bản cho Swagger document
  const config = new DocumentBuilder()
    .setTitle('ADN-Testing-Management') // Tiêu đề hiển thị trên Swagger UI
    .setDescription('ADN Testing Management System') // Mô tả chi tiết hơn về API
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  // Tạo Swagger document dựa trên cấu hình và ứng dụng NestJS
  // NestJS sẽ tự động quét các controller và DTO có decorator của @nestjs/swagger
  const document = SwaggerModule.createDocument(app, config)

  // Thiết lập endpoint để phục vụ Swagger UI
  // '/api-docs' là đường dẫn bạn sẽ truy cập để xem UI (ví dụ: http://localhost:3000/api-docs)
  // Tham số thứ 2 là instance của ứng dụng NestJS
  // Tham số thứ 3 là document đã tạo ở trên
  SwaggerModule.setup('api/v1', app, document)

  // --- Kết thúc cấu hình Swagger ---

  const port = configService.get<number>('PORT') || 3000
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  console.log(`Swagger UI available at http://localhost:${port}/api/v1`)
  console.log(
    `API documentation available at http://localhost:${port}/api/v1-json`,
  )
}
void bootstrap()
