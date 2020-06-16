import { BaseConfig, BuildingConfig, BuildingInfoConfig } from '../model/hkPostApiModel';
import { GeocodingConfig, LongLatConfig } from '../model/geoApiModel';

import axios from 'axios';

export const fetch = async (
  url: string,
  filter: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig,
): Promise<any> => {
  url = url + concatOptions(filter);
  console.log(url);
  const res = await axios.get(url);
  if (res.status !== 200) {
    throw Error('HKPost Api returned' + res.status);
  }
  return res.data;
};

const concatOptions = (options: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig) => {
  let str = '';
  Object.entries(options).forEach(([key, val]) => {
    const tmp = `${key}=${val.toString()}`;
    str = str + '&' + tmp;
  });
  return encodeURI(str);
};

export const post = async (url: string, formData: any) => {
  try {
    url = url + concatOptions(formData);
    const res = await axios.post(url);
    return res;
  } catch (err) {
    throw Error('HKPost Post failed!' + err);
  }
};
