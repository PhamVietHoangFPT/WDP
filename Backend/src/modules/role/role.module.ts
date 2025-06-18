// src/role/role.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Role, RoleSchema } from './schemas/role.schema'
import { IRoleRepository } from './interfaces/irole.repository'
import { RoleRepository } from './role.repository'
// import { RoleService } from './role.service'; // Nếu có
// import { RoleController } from './role.controller'; // Nếu có

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    // Role.name sẽ trả về chuỗi "Role". Đây là tên mà Mongoose sẽ sử dụng.
  ],
  providers: [
    {
      provide: IRoleRepository,
      useClass: RoleRepository,
    },
  ],
  exports: [MongooseModule, IRoleRepository],
})
export class RoleModule {}
