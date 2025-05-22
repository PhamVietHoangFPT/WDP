import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Blog, BlogSchema } from './schemas/blog.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  exports: [MongooseModule],
})
export class BlogModule {}
