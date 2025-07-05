import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import mongoose from 'mongoose'
import { CreateKitShipmentDto } from './createKitShipment.dto'

export class UpdateKitShipmentDto {
    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID trạng thái vận chuyển không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    currentStatus: mongoose.Schema.Types.ObjectId

    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID case member không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    caseMember: mongoose.Schema.Types.ObjectId

    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID sampling kit inventory không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    samplingKitInventory: mongoose.Schema.Types.ObjectId

    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID địa chỉ không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    address: mongoose.Schema.Types.ObjectId


    @ApiProperty({
        example: '67f697151bfaa0e9cf14ec92',
        required: true,
        type: String,
    })
    @IsNotEmpty({ message: 'ID nhân viên không được để trống' })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    deliveryStaff: mongoose.Schema.Types.ObjectId

    constructor(partial: Partial<CreateKitShipmentDto>) {
        Object.assign(this, partial)
    }
}
