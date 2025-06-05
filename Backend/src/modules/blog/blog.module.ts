import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from './schemas/blog.schema'
import { BlogService } from './blog.service'
import { BlogRepository } from './blog.repository'
import { AuthModule } from '../auth/auth.module'
import { IBlogService } from './interfaces/iblog1.service'
import { IBlogRepository } from './interfaces/iblog1.repository'
import { BlogController } from './blog.controller'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    AuthModule,
    AccountModule,
  ],
  controllers: [BlogController],
  providers: [
    { provide: IBlogRepository, useClass: BlogRepository },
    { provide: IBlogService, useClass: BlogService },
  ],
  exports: [IBlogService, IBlogRepository],
})
export class BlogModule {}
