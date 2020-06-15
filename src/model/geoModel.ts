export interface LatLng {
  lat?: number;
  lng?: number;
  raw?: string;
  remark?: string;
}

export interface Geocode {
  result?: string;
  match?: boolean;
  remark?: string;
}
