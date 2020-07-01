import { BaseConfig, BuildingConfig, BuildingInfoConfig } from '../model/hkPostApiModel';
import { GeocodingConfig, LongLatConfig } from '../model/geoApiModel';

import axios from 'axios';

const headers = {
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip',
  'Accept-Language': 'zh-TW,zh;q=0.9,zh-HK;q=0.8,en-US;q=0.7,en;q=0.6,ja-JP;q=0.5,ja;q=0.4',
  Origin: 'https://www.hongkongpost.hk',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
};
const waitTime = 1000;
const wait = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

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
    await wait(waitTime);
    const res = await axios.get(url, {
      headers: headers,
    });
    if (res.status === 500) throw Error('Internal Server Error (Overload?) - ' + url);
    return res.data;
  } catch (err) {
    if (err.message === 'Request failed with status code 403') console.error('Blocked by Cloudfront - ' + url);
    console.error(err.message + ' - ' + url);
    return undefined;
  }
};

export const post = async (
  url: string,
  formData: BaseConfig | BuildingConfig | BuildingInfoConfig | LongLatConfig | GeocodingConfig,
): Promise<any> => {
  url = url + concatOptions(formData);
  try {
    await wait(waitTime); // To prevent getting banned from HK post
    const res = await axios.post(url, {
      headers: { ...headers, referer: 'https://www.hongkongpost.hk/correct_addressing/index.jsp?lang=zh_TW' },
    });
    if (res.status === 403) throw Error('Blocked by Cloudfront - ' + url);
    if (res.status === 500) throw Error('Internal Server Error (Overload?) - ' + url);
    return res;
  } catch (err) {
    if (err.message === 'Request failed with status code 403') console.error('Blocked by Cloudfront - ' + url);
    console.error(err.message + ' - ' + url);
    return undefined;
  }
};
