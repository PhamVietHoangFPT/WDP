import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common' // Nên có để validate DTOs
import * as dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // (Tùy chọn nhưng khuyến khích) Bật Global Validation Pipe
  // Giúp Swagger hoạt động tốt với các validation decorator trong DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không được định nghĩa trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ: string sang number)
    }),
  )

  // --- Bắt đầu cấu hình Swagger ---

  // Tạo một đối tượng cấu hình cơ bản cho Swagger document
  const config = new DocumentBuilder()
    .setTitle('betta-fish-shop') // Tiêu đề hiển thị trên Swagger UI
    .setDescription('Shop bán cá betta') // Mô tả chi tiết hơn về API
    .setVersion('1.0') // Phiên bản API
    // .addTag('auth') // Thêm các tag để nhóm các API (ví dụ: auth, users, products)
    // .addTag('users')
    .addBearerAuth() // Nếu bạn sử dụng JWT Bearer Token để xác thực
    // Thêm các cấu hình khác nếu cần (ví dụ: addApiKey(), addOAuth2())
    .build() // Hoàn tất cấu hình

  // Tạo Swagger document dựa trên cấu hình và ứng dụng NestJS
  // NestJS sẽ tự động quét các controller và DTO có decorator của @nestjs/swagger
  const document = SwaggerModule.createDocument(app, config)

  // Thiết lập endpoint để phục vụ Swagger UI
  // '/api-docs' là đường dẫn bạn sẽ truy cập để xem UI (ví dụ: http://localhost:3000/api-docs)
  // Tham số thứ 2 là instance của ứng dụng NestJS
  // Tham số thứ 3 là document đã tạo ở trên
  SwaggerModule.setup('api/v1', app, document)

  // --- Kết thúc cấu hình Swagger ---

  const port = process.env.PORT || 3000
  await app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  console.log(`Swagger UI available at http://localhost:${port}/api/v1`)
}
void bootstrap()
