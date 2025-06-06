import { CreateBlogImageDto } from '../dto/createImage.dto'

export interface IImageUploadService {
  uploadFileForBlog(
    file: Express.Multer.File,
    createBlogImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<{ url: string; _id: string }>
}

export const IImageUploadService = Symbol('IImageUploadService')
