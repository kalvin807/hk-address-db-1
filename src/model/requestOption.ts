export interface BaseOption {
  lang?: string;
  lang1?: string;
}

export interface DistrictOption extends BaseOption {
  zone_value: number;
}

export interface BuildingOption extends BaseOption {
  type_value: string;
  zone: string;
  district: string;
  building: string;
  estate_name: string;
  street_name: string;
  streetno: string;
  phase: string;
  status: string;
}

export interface BuildingInfoOption extends BaseOption {
  type_value: string;
  zone: string;
  district: string;
  building: string;
  estate: string;
  street: string;
  streetno: string;
  phase: string;
  status: string;
}

export const baseBuildingOption: BuildingOption = {
  lang: 'en_US',
  type_value: '',
  zone: '',
  district: '',
  building: '',
  estate_name: '',
  street_name: '',
  streetno: '',
  phase: '',
  status: '0',
};

export const baseBuildingInfoOption: BuildingInfoOption = {
  lang: 'en_US',
  lang1: 'en_US',
  type_value: '',
  zone: '',
  district: '',
  building: '',
  estate: '',
  street: '',
  streetno: '',
  phase: '',
  status: '0',
};
