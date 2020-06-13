export interface BaseOption {
    lang1: string;
}

export interface DistrictOption extends BaseOption {
    zone_value: number;
}

export const baseOption: BaseOption = {
    lang1: 'en_US',
};
