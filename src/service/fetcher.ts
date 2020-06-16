import { BaseConfig, BuildingConfig, BuildingInfoConfig } from '../model/hkPostApiModel';
import { GeocodingConfig, LongLatConfig } from '../model/geoApiModel';

import axios from 'axios';

const concatOptions = (options: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig) => {
  let str = '';
  Object.entries(options).forEach(([key, val]) => {
    const tmp = `${key}=${encodeURIComponent(val.toString())}`;
    str = str + '&' + tmp;
  });
  return str;
};

export const fetch = async (
  url: string,
  filter: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig,
): Promise<any> => {
  url = url + concatOptions(filter);
  try {
    const res = await axios.get(url);
    if (res.status !== 200) throw Error('Api returned' + res.status);
    return res.data;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export const post = async (
  url: string,
  formData: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig,
): Promise<any> => {
  url = url + concatOptions(formData);
  try {
    const res = await axios.post(url);
    if (res.status !== 200) throw Error('Api returned' + res.status);
    return res;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
