import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Transform } from 'class-transformer'
import mongoose, { Date } from 'mongoose'
import { TestResultShipment } from '../schemas/testResultShipment.schema'

@Exclude()
export class TestResultShipmentResponseDto {
    @Expose()
    @ApiProperty({ example: '605e3f5f4f3e8c1d4c9f1e1a', type: String })
    @Transform(({ value }) => value?.toString(), { toPlainOnly: true })
    _id: mongoose.Schema.Types.ObjectId

    @Expose()
    @ApiProperty({
        type: Date,

        example: '2023-10-01T00:00:00.000Z',
        nullable: true
    })
    testResultDispatchedDate: Date | null

    @Expose()
    @ApiProperty({
        type: Date,
         example: '2023-10-01T00:00:00.000Z'
         , nullable: true,
    })
    testResultDeliveryDate: Date | null

    @Expose()
    @ApiProperty({
        example: '2023-10-01T00:00:00.000Z',
        type: Date,
        nullable: true,
    })
    deleted_at: Date | null


    constructor(partial: Partial<TestResultShipment>) {
        Object.assign(this, partial)
    }
}
