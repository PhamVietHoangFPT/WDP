import { Express } from 'express'

export interface IImageUploadService {
  uploadFile(file: Express.Multer.File): Promise<{ url: string; id: string }>
}

export const IImageUploadService = Symbol('IImageUploadService')
