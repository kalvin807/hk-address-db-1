import { AddressAttribute, StreetNo } from '../model/addressModel';
import { BaseConfig, BuildingConfig, BuildingInfoConfig } from '../model/hkPostApiModel';

import { fetch } from './fetcher';

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
const fetchFromHKPost = async (
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

export const fetchAllFromHKPost = async (url: string, configs: BaseConfig[]): Promise<AddressAttribute[][]> => {
  const nestedRes: AddressAttribute[][] = [];
  for (const config of configs) nestedRes.push(await fetchFromHKPost(url, config));
  return nestedRes;
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
  res.split('\n').forEach((line: string) => {
    const matched = line.match(/<.+"(.+)">(.*)<.*>/);
    if (matched)
      streetNos.push({
        value: matched[1],
        name: matched[2],
      });
  });
  return streetNos;
};
