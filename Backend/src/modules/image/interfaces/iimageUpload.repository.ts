import { ImageDocument } from '../schemas/image.schemas'
import { CreateBlogImageDto } from '../dto/createImage.dto'
export interface IImageUploadRepository {
  createForBlog(
    url: string,
    createImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<ImageDocument>
  findById(id: string): Promise<ImageDocument | null>
  findAllImageForBlog(blogId: string): Promise<ImageDocument[]>
  deleteById(id: string, userId: string): Promise<ImageDocument | null>
}

export const IImageUploadRepository = Symbol('IImageUploadRepository')
