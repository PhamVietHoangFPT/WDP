import type { SampleType } from "./sampleType";

export interface Sample {
    id: string
    name: string;
    fee: number;
    sampleType: SampleType
    delete_by: string;
    delete_at: Date;
}