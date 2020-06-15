import { Geocode, LatLng } from './geoModel';

export interface Address {
  region: AddressAttribute;
  district: AddressAttribute;
  building: AddressAttribute;
  street?: AddressAttribute;
  streetNo?: StreetNo;
  estate?: AddressAttribute;
  phase?: AddressAttribute;
  floor?: AddressAttribute;
  unit?: AddressAttribute;
  latlng?: LatLng;
  geocode?: Geocode;
}

export interface AddressAttribute {
  zh_name: string;
  en_name: string;
  value: string;
  id?: number;
}

export interface StreetNo {
  name: string;
  value: string;
}

export interface Building extends AddressAttribute {
  region: AddressAttribute;
  district: AddressAttribute;
  street: AddressAttribute[];
  estate: AddressAttribute[];
}
