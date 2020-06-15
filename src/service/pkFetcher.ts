import { GeocodingConfig, GeocodingResponse, LngLatResponse, LongLatConfig, pokeResponse } from '../model/geoApiModel';

import { Address } from '../model/addressModel';
import { LatLng } from '../model/geoModel';
import { add } from 'lodash';
import { fetch } from './fetcher';

const fetchFromPK = async (url: string, config: LongLatConfig | GeocodingConfig): Promise<pokeResponse | undefined> => {
  try {
    const res = await fetch(url, config);
    return res;
  } catch (err) {
    throw err;
  }
};

export const fetchLatLng = async (addr: Address): Promise<LngLatResponse | undefined> => {
  const query = addr.street && addr.streetNo ? addr.street.zh_name + addr.streetNo.name : addr.building.zh_name;
  const url = process.env.LATLNG_URL || '';
  return await fetchFromPK(url, { query: query });
};

export const fetchGeocode = async (lat: number, lng: number): Promise<GeocodingResponse | undefined> => {
  const url = process.env.GEOCODING_URL || '';
  return await fetchFromPK(url, { lat: lat, lng: lng });
};
