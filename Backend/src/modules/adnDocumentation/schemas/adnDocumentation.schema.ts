import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import mongoose, { HydratedDocument } from 'mongoose'
import { BaseEntity } from 'src/common/schema/baseEntity.schema'

// --- Schema chính ---
export type AdnDocumentationDocument = HydratedDocument<AdnDocumentation>

// --- Schema con cho một điểm đánh dấu di truyền ---
@Schema({ _id: false }) // Không cần _id cho schema con
export class GeneticMarker {
  @Prop({ type: String, required: true })
  locus: string // Tên của locus, ví dụ: "D8S1179"

  @Prop({ type: [String], required: true })
  alleles: string[] // Mảng các giá trị Alen, ví dụ: ["13", "15.3"]
}
export const GeneticMarkerSchema = SchemaFactory.createForClass(GeneticMarker)

// --- Schema con cho hồ sơ di truyền của một người ---
@Schema({ _id: false })
export class IndividualProfile {
  @Prop({ type: String, required: true })
  sampleIdentifyNumber: string // GUID của mẫu, liên kết đến người cụ thể

  @Prop({ type: [GeneticMarkerSchema], required: true })
  markers: GeneticMarker[] // Danh sách các kết quả phân tích locus
}
export const IndividualProfileSchema =
  SchemaFactory.createForClass(IndividualProfile)

@Schema()
export class AdnDocumentation extends BaseEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCase',
    required: true,
    index: true,
  })
  serviceCase: mongoose.Schema.Types.ObjectId // Liên kết đến hồ sơ dịch vụ tổng

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: true,
  })
  doctor: mongoose.Schema.Types.ObjectId // Bác sĩ nhập liệu

  @Prop({ type: [IndividualProfileSchema], required: true })
  profiles: IndividualProfile[] // Mảng chứa hồ sơ di truyền của những người tham gia
}

export const AdnDocumentationSchema =
  SchemaFactory.createForClass(AdnDocumentation)
