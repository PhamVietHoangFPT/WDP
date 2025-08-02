import { CreateImageKitShipmentDto } from './../dto/createImageShipment.dto'
import { CreateBlogImageDto } from '../dto/createImage.dto'
import { CreateImageResultDto } from '../dto/createResult.dto'
import { ImageDocument } from '../schemas/image.schemas'
import { CreateServiceCaseImageDto } from '../dto/createServiceCaseImage.dto'

export interface IImageUploadService {
  uploadFileForBlog(
    file: Express.Multer.File,
    createBlogImageDto: CreateBlogImageDto,
    userId: string,
  ): Promise<{ url: string; _id: string }>

  uploadFileForShipment(
    file: Express.Multer.File,
    createImageKitShipmentDto: CreateImageKitShipmentDto,
    userId: string,
  ): Promise<{ url: string; _id: string }>

  uploadFileForResult(
    file: Express.Multer.File,
    createImageResultDto: CreateImageResultDto,
    userId: string,
  ): Promise<{ url: string; _id: string }>

  uploadFileForServiceCase(
    file: Express.Multer.File,
    createImageDto: CreateServiceCaseImageDto,
    userId: string,
  ): Promise<{ url: string; _id: string }>

  findAllForServiceCase(serviceCaseId: string): Promise<ImageDocument[]>

  findAllForBlog(blogId: string): Promise<ImageDocument[]>

  findAllForKitShipment(kitShipmentId: string): Promise<ImageDocument[]>

  findAllForResult(resultId: string): Promise<ImageDocument[]>

  findById(id: string): Promise<ImageDocument | null>

  deleteById(id: string, userId: string): Promise<boolean>

  findByCreatedBy(userId: string): Promise<ImageDocument[]>
}

export const IImageUploadService = Symbol('IImageUploadService')
