import { AddressAttribute, StreetNo } from '../model/addressModel';
import { BaseConfig, BuildingConfig, BuildingInfoConfig } from '../model/configModel';

import axios from 'axios';

export const fetch = async (
  url: string,
  options: BaseConfig | BuildingConfig | BuildingInfoConfig,
): Promise<string> => {
  url = url + concatOptions(options);
  console.log(url);
  const res = await axios.get(url);
  if (res.status !== 200) {
    throw Error('HKPost Api returned' + res.status);
  }
  return res.data;
};

const concatOptions = (options: BaseConfig | BuildingConfig | BuildingInfoConfig) => {
  let str = '';
  Object.entries(options).forEach(([key, val]) => {
    const tmp = `${key}=${val.toString()}`;
    str = str + '&' + tmp;
  });
  return str;
};

export const fetchAllFromHKPost = async (url: string, configs: BaseConfig[]): Promise<AddressAttribute[][]> => {
  const nestedRes: AddressAttribute[][] = [];
  for (const config of configs) nestedRes.push(await fetchFromHKPost(url, config));
  return nestedRes;
};

export const fetchFromHKPost = async (
  url: string,
  config: BaseConfig | BuildingConfig | BuildingInfoConfig,
): Promise<AddressAttribute[]> => {
  try {
    const res = await fetch(url, config);
    return extractFeatures(res);
  } catch (err) {
    throw err;
  }
};

const extractFeatures = (rawStr: string): AddressAttribute[] => {
  const features: AddressAttribute[] = [];
  rawStr.split('\n').map((line) => {
    const matched = line.match(/.*"(.+)">(.+) &nbsp;\((.+)\)<.*>/);
    if (matched)
      features.push({
        value: matched[1],
        en_name: matched[2],
        zh_name: matched[3],
      });
  });
  return features;
};

export const fetchStreet = async (config: BuildingInfoConfig): Promise<AddressAttribute[]> => {
  const url = process.env.STREET_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Street' });
};

export const fetchEstate = async (config: BuildingInfoConfig): Promise<AddressAttribute[]> => {
  const url = process.env.ESTATE_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Estate' });
};

export const fetchPhase = async (config: BuildingInfoConfig): Promise<AddressAttribute[]> => {
  const url = process.env.PHASE_URL || ' ';
  return fetchFromHKPost(url, { ...config });
};

export const fetchBuilding = async (config: BuildingConfig): Promise<AddressAttribute[]> => {
  const url = process.env.BUILDING_URL || ' ';
  return fetchFromHKPost(url, { ...config, type_value: 'Building' });
};

// Edge case
export const fetchStreetNo = async (config: BuildingInfoConfig): Promise<StreetNo[]> => {
  const url = process.env.STREETNO_URL || ' ';
  const res = await fetch(url, config);
  const streetNos: StreetNo[] = [];
  res.split('\n').forEach((line) => {
    const matched = line.match(/<.+"(.+)">(.*)<.*>/);
    if (matched)
      streetNos.push({
        value: matched[1],
        name: matched[2],
      });
  });
  return streetNos;
};
