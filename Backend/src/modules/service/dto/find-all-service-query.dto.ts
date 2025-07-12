import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindAllServiceQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return value;
    })
    isAgnate?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return value;
    })
    isAdministration?: boolean;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === undefined) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return value;
    })
    isSelfSampling?: boolean;
}
