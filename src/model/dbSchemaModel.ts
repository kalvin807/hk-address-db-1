export interface BaseSchema {
  id?: number;
  name?: string;
  zh_name?: string;
  en_name?: string;
}

export interface RelationshipSchema {
  [table: string]: number | undefined;
}

export interface GeoSchema {
  [table: string]: number | string | boolean | undefined;
}
