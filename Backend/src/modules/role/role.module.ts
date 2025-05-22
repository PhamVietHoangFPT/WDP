// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Role, RoleSchema } from './schemas/role.schema'
// import { RoleService } from './role.service'; // Nếu có
// import { RoleController } from './role.controller'; // Nếu có

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    // Role.name sẽ trả về chuỗi "Role". Đây là tên mà Mongoose sẽ sử dụng.
  ],
  // controllers: [RoleController], // Bỏ comment nếu có
  // providers: [RoleService],    // Bỏ comment nếu có
  exports: [MongooseModule], // Quan trọng: Export MongooseModule để các module khác
  // có thể inject RoleModel hoặc để populate hoạt động
  // khi RoleModule được import.
})
export class RoleModule {}
