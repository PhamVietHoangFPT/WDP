import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Image, ImageDocument } from './schemas/image.schemas'
import { Express } from 'express'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class ImageUploadService {
  constructor(
    @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
  ): Promise<{ url: string; id: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const fileName = `${uuidv4()}-${file.originalname}`
    const filePath = path.join(uploadDir, fileName)

    fs.writeFileSync(filePath, file.buffer)

    const url = `/uploads/${fileName}`

    const saved = await this.imageModel.create({
      url,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    return { url: saved.url, id: saved.id.toString() }
  }
}
