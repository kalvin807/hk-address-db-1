export interface BaseSchema {
  id?: number;
  name?: string;
  zh_name?: string;
  en_name?: string;
}
export interface DistrictSchema extends BaseSchema {
  region: number;
}
