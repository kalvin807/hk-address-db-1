import { Address, AddressAttribute, Building, StreetNo, ValidAddress } from '../model/addressModel';
import {
  BaseConfig,
  BuildingConfig,
  BuildingInfoConfig,
  DistrictConfig,
  baseBuildingInfoConfig,
} from '../model/hkPostApiModel';
import { fetch, post } from './fetcher';

const extractFeatures = (rawStr: string): AddressAttribute[] => {
  const features: AddressAttribute[] = [];
  rawStr.split('\n').map((line) => {
    const matched = line.match(/([^"]+)">[ ]?(.*) &nbsp;\(([^)]+)/);
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

export const fetchDistrict = async (config: DistrictConfig): Promise<AddressAttribute[]> => {
  const url = process.env.DISTRICT_URL || ' ';
  return fetchFromHKPost(url, config);
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

export const fetchFloor = async (config: BuildingInfoConfig): Promise<AddressAttribute[]> => {
  const url = process.env.FLOOR_URL || ' ';
  return fetchFromHKPost(url, config);
};

export const fetchUnit = async (config: BuildingInfoConfig): Promise<AddressAttribute[]> => {
  const url = process.env.UNIT_URL || ' ';
  return fetchFromHKPost(url, config);
};

// Edge case
export const fetchStreetNo = async (config: BuildingInfoConfig): Promise<StreetNo[]> => {
  const url = process.env.STREETNO_URL || ' ';
  const res = await fetch(url, config);
  const streetNos: StreetNo[] = [];
  res.split('\n').forEach((line: string) => {
    const matched = line.match(/"([^"]+)">[ ]?([^<]+)<\//);
    if (matched)
      streetNos.push({
        value: matched[1],
        name: matched[2],
      });
  });
  return streetNos;
};

export const fetchValidAddr = async (addr: Address): Promise<ValidAddress | undefined> => {
  // Prepare form data
  const data: any = {
    zone: addr.region.value,
    district: addr.district.value,
    street: addr.street?.value,
    strno: addr.streetNo?.value,
    estate: addr.estate?.value,
    phase: addr.phase?.value,
    building: addr.building?.value,
    floor: addr.floor?.value,
    unit: addr.unit?.value,
    lang: 'zh_TW',
  };
  Object.entries(data).forEach(([key, val]) => {
    if (val) data[key] = `${val}`.replace(/[ ]/g, '+');
    else delete data[key];
  });
  const url = process.env.VALIDADDR_URL || ' ';

  // Send the POST request
  const res = await post(url, data);
  let validAddr: ValidAddress = { remark: '' };

  // Grep the address from html
  if (res && res.data) {
    const rawHtml: string = res.data;
    const match = rawHtml.match(/<[^>]+><[^>]+><[^>]+><[^>]+><f[^>]+>(.*)<\/f/gm);

    if (!match) validAddr.remark = 'Incorrect HTML';

    if (match && match.length > 0) {
      const validAddrs = match.map((str) => {
        const tmp = str.match(/<f[^>]+>(.*)<\/f/);
        if (tmp) return tmp[1].replace(/<br \/\>/g, ' ');
        else {
          validAddr.remark = 'Incorrect Regex when prettify address';
          return str;
        }
      });

      if (validAddrs)
        validAddr = {
          ...validAddr,
          en_name: validAddrs[0],
          zh_name: validAddrs[1],
        };
    }
  } else {
    validAddr.remark = 'Failed POST';
  }

  return validAddr;
};

export const fetchBuildingInfo = async (building: Building): Promise<Building> => {
  const baseConfig = {
    ...baseBuildingInfoConfig,
    building: building.value,
    zone: building.region.value,
    district: building.district.value,
  };
  const street = await fetchStreet(baseConfig);
  const estate = await fetchEstate(baseConfig);
  return {
    ...building,
    street: street,
    estate: estate,
  } as Building;
};
