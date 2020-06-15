import { Geocode, LatLng } from '../model/geoModel';
import { fetchGeocode, fetchLatLng } from './pkFetcher';

import { Address } from '../model/addressModel';
import { RawLatLng } from '../model/geoApiModel';
import { unicodeToStr } from '../utils/helper';

const compare = (a: string, b: string) => {
  if (a && b) return a === b;
  else return false;
};

const include = (substr: string, str: string) => {
  if (substr && str) return str.includes(substr);
  else return false;
};

const compareLatLngResult = (addr: Address, result: RawLatLng) => {
  const address = streetAddr(addr);
  return {
    address: include(address, unicodeToStr(result.address)),
    building: compare(addr.building.zh_name, unicodeToStr(result.name)),
  };
};

const findLatLng = (addr: Address, results: RawLatLng[]) => {
  if (results) {
    const address = streetAddr(addr);
    return (
      results.find((result) => {
        include(address, unicodeToStr(result.address)) && compare(addr.building.zh_name, unicodeToStr(result.name));
      }) ||
      results.find((result) => {
        include(address, unicodeToStr(result.address));
      }) ||
      results.find((result) => {
        compare(addr.building.zh_name, unicodeToStr(result.name));
      }) ||
      results[0]
    );
  }
  return undefined;
};

const streetAddr = (addr: Address) => `${addr.street && addr.street.zh_name}${addr.streetNo && addr.streetNo.name}`;

export const getLatLng = async (addr: Address): Promise<LatLng> => {
  const res = await fetchLatLng(addr);
  const result: LatLng = {
    raw: JSON.stringify(res),
  };
  if (!res) {
    result.remark = 'No response';
  } else if (res?.success === false) {
    result.remark = 'Failed request';
  } else {
    const hit = findLatLng(addr, res.result);
    if (!hit) {
      result.remark = 'Not match';
    } else {
      result.lat = hit.lat;
      result.lng = hit.lng;
      result.remark = JSON.stringify({ match: res.result.map((result) => compareLatLngResult(addr, result)) });
    }
  }
  return result;
};

export const getGeocoding = async (addr: Address): Promise<Geocode | undefined> => {
  if (!addr.latlng?.lat || !addr.latlng?.lng) return undefined;
  const result: Geocode = {};
  const res = await fetchGeocode(addr.latlng.lat, addr.latlng.lng);
  if (!res) {
    result.remark = 'No response';
  } else if (res?.success === false) {
    result.remark = 'Failed request';
  } else {
    const reverseGeo = unicodeToStr(res.result[0]);
    result.result = reverseGeo;
    result.match = reverseGeo === addr.building.zh_name;
  }
  return result;
};
