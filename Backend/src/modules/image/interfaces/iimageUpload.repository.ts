import { ImageDocument } from '../schemas/image.schemas'
import { CreateBlogImageDto } from '../dto/createImage.dto'
import { CreateImageKitShipmentDto } from '../dto/createImageShipment.dto'
import { CreateImageResultDto } from '../dto/createResult.dto'
import { CreateServiceCaseImageDto } from '../dto/createServiceCaseImage.dto'
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

  createImageForResult(
    url: string,
    createImageDto: CreateImageResultDto,
    userId: string,
  ): Promise<ImageDocument>

  createImageForServiceCase(
    url: string,
    createImageDto: CreateServiceCaseImageDto,
    userId: string,
  ): Promise<ImageDocument>

  findAllImageForServiceCase(serviceCaseId: string): Promise<ImageDocument[]>

  findById(id: string): Promise<ImageDocument | null>

  findAllImageForBlog(blogId: string): Promise<ImageDocument[]>

  deleteById(id: string, userId: string): Promise<ImageDocument | null>

  findAllImageForKitShipment(kitShipmentId: string): Promise<ImageDocument[]>

  findAllImageForResult(kitShipmentId: string): Promise<ImageDocument[]>

  findByCreatedBy(
    userId: string,
    serviceCaseId: string,
  ): Promise<ImageDocument[]>
}

export const IImageUploadRepository = Symbol('IImageUploadRepository')
