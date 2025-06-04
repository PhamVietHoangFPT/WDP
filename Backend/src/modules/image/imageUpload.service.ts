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
  ): Promise<{ url: string; _id: string }> {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir)
    }

    const fileName = `${uuidv4()}-${file.originalname}`
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, file.buffer)

    const url = `/uploads/${fileName}`

    const saved: ImageDocument = await this.imageModel.create({
      url,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })

    return {
      url: saved.url,
      _id: saved.id.toString(),
    }
  }

  async findAll(): Promise<Image[]> {
    return this.imageModel.find({ isDeleted: false }).lean().exec()
  }

  async findById(id: string): Promise<Image | null> {
    return this.imageModel.findOne({ _id: id, isDeleted: false }).lean().exec()
  }

  async deleteById(id: string): Promise<boolean> {
    const image = await this.imageModel.findById(id)
    if (!image || image.isDeleted) return false

    image.isDeleted = true
    await image.save()
    return true
  }

  async findDeleted(): Promise<Image[]> {
    return this.imageModel.find({ isDeleted: true }).lean().exec()
  }
}
