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
    await new Promise((r) => setTimeout(r, Math.random() * (10000 - 2000 + 1))); // To prevent getting banned from HK post
    const res = await axios.get(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
      },
    });
    if (res.status === 403) throw Error('Blocked by Cloudfront');
    if (res.status === 500) throw Error('Internal Server Error (Overload?)');
    return res.data;
  } catch (err) {
    console.log(url);
    console.error(err.message);
    return undefined;
  }
};

export const post = async (
  url: string,
  formData: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig,
): Promise<any> => {
  url = url + concatOptions(formData);
  try {
    await new Promise((r) => setTimeout(r, Math.random() * (10000 - 2000 + 1))); // To prevent getting banned from HK post
    const res = await axios.post(url, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.106 Safari/537.36',
      },
    });
    if (res.status === 403) throw Error('Blocked by Cloudfront');
    if (res.status === 500) throw Error('Internal Server Error (Overload?)');
    return res;
  } catch (err) {
    console.log(url);
    console.error(err.message);
    return undefined;
  }
};
