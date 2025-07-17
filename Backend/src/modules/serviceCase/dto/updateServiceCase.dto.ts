import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'
import mongoose from 'mongoose'

export class UpdateServiceCasenDto {
    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID condition không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    condition: mongoose.Schema.Types.ObjectId
}
