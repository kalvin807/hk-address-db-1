import { BaseOption, BuildingInfoOption, BuildingOption } from '../model/requestOption';

import { AddressAttribute } from '../model/address';
import axios from 'axios';

export const fetch = async (
  url: string,
  options: BaseOption | BuildingOption | BuildingInfoOption,
): Promise<string> => {
  url = url + concatOptions(options);
  console.log(url);
  const res = await axios.get(url);
  if (res.status !== 200) {
    throw Error('HKPost Api returned' + res.status);
  }
  return res.data;
};

const concatOptions = (options: BaseOption | BuildingOption | BuildingInfoOption) => {
  let str = '';
  Object.entries(options).forEach(([key, val]) => {
    const tmp = `${key}=${val.toString()}`;
    str = str + '&' + tmp;
  });
  return str;
};

export const fetchAllFromHKPost = async (url: string, configs: BaseOption[]): Promise<AddressAttribute[][]> => {
  const res = configs.map((configs) => {
    return fetch(url, configs);
  });
  const results = await Promise.all(res);
  return results.map((val) => extractFeatures(val));
};

export const fetchFromHKPost = async (
  url: string,
  config: BaseOption | BuildingOption | BuildingInfoOption,
): Promise<AddressAttribute[]> => {
  try {
    const res = await fetch(url, config);
    return extractFeatures(res);
  } catch (err) {
    throw err;
  }
};

const extractFeatures = (rawStr: string): AddressAttribute[] => {
  const htmlRegex = /<option value="(.+)">(.*)<.*>/g; // Expected to grep value and the value of the html
  const matchedLines = rawStr.split('\n').map((line) => {
    htmlRegex.lastIndex = 0;
    const matched = htmlRegex.exec(line);
    if (matched) {
      return [matched[1], matched[2]];
    }
  });
  const features: AddressAttribute[] = [];
  const nameRegex = /(.+) &nbsp;\((.+)\)/g; // Expected to get the Eng Name and Chi name in the bracket
  matchedLines.forEach((line) => {
    if (line) {
      nameRegex.lastIndex = 0;
      const names = nameRegex.exec(line[1]);
      if (names)
        features.push({
          value: line[0],
          en_name: names[1],
          zh_name: names[2],
        });
    }
  });
  return features;
};

export const fetchStreet = (config: BuildingInfoOption): Promise<AddressAttribute[]> => {
  const url = process.env.STREET_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Street' });
};

export const fetchEstate = (config: BuildingInfoOption): Promise<AddressAttribute[]> => {
  const url = process.env.ESTATE_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Estate' });
};

export const fetchPhase = (config: BuildingInfoOption): Promise<AddressAttribute[]> => {
  const url = process.env.PHASE_URL || ' ';
  return fetchFromHKPost(url, { ...config });
};

export const fetchBuilding = (config: BuildingOption): Promise<AddressAttribute[]> => {
  const url = process.env.BUILDING_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Building' });
};
