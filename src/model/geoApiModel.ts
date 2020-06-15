import { LatLng } from './geoModel';

export interface LongLatConfig {
  query: string;
}

export interface GeocodingConfig {
  lat: number;
  lng: number;
}

export interface pokeResponse {
  success: boolean;
  result: any[];
}

export interface LngLatResponse extends pokeResponse {
  result: RawLatLng[];
}

export interface GeocodingResponse extends pokeResponse {
  result: string[];
}

export interface RawLatLng {
  name: string;
  address: string;
  lat: number;
  lng: number;
}
