import { ImageDocument } from '../schemas/image.schemas'
import { CreateBlogImageDto } from '../dto/createImage.dto'
import { CreateImageKitShipmentDto } from '../dto/createImageShipment.dto'
export interface IImageUploadRepository {
  createForBlog(
    url: string,
    createImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<ImageDocument>
  createImageForKitShipmemt(
    url: string,
    createImageDto: CreateImageKitShipmentDto,
    userId: string,
  ): Promise<ImageDocument>
  findById(id: string): Promise<ImageDocument | null>
  findAllImageForBlog(blogId: string): Promise<ImageDocument[]>
  deleteById(id: string, userId: string): Promise<ImageDocument | null>
  findAllImageForKitShipment(kitShipmentId: string): Promise<ImageDocument[]>

}

export const IImageUploadRepository = Symbol('IImageUploadRepository')
