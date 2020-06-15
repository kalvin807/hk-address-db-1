export interface BaseConfig {
  lang?: string;
  lang1?: string;
}

export interface DistrictConfig extends BaseConfig {
  zone_value: number;
}

export interface BuildingConfig extends BaseConfig {
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

export interface BuildingInfoConfig extends BaseConfig {
  type_value: string;
  zone: string;
  district: string;
  building: string;
  estate: string;
  street: string;
  streetno: string;
  phase: string;
  status: string;
  strno?: string;
  floor?: string;
}

export const baseBuildingConfig: BuildingConfig = {
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

export const baseBuildingInfoConfig: BuildingInfoConfig = {
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
  strno: '',
};
