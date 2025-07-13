import { Type } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

export class FilterServiceDto {
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isAgnate?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isAdministration?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isSelfSampling?: boolean;
}
