import { Address, AddressAttribute, Building } from '../model/addressModel';
import {
  BuildingConfig,
  BuildingInfoConfig,
  baseBuildingConfig,
  baseBuildingInfoConfig,
} from '../model/hkPostApiModel';
import { fetchBuilding, fetchBuildingInfo, fetchPhase, fetchStreet, fetchStreetNo } from './hkPostFetcher';

import isEqual from 'lodash/isEqual';

export const getUniqueAddresses = async (building: Building): Promise<Address[]> => {
  const addresses: Address[] = [];
  const buildingInfo: AddressAttribute = {
    zh_name: building.zh_name,
    en_name: building.en_name,
    value: building.value,
  };

  // Fetch street and estate info of this building
  const info = await fetchBuildingInfo(building);

  if (!info.estate || info.estate.length < 1) {
    // Not a building from estate
    info.street.forEach((street) => {
      addresses.push({
        building: buildingInfo,
        region: building.region,
        estate: undefined,
        district: building.district,
        street: street,
      });
    });
  } else {
    const addrPromise = info.estate.map((estate) =>
      getAddrFromEstate(buildingInfo, estate, info.street, info.region, info.district),
    );
    addresses.concat(await Promise.all(addrPromise));
  }

  // Add StreetNo if exist
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    const config: BuildingInfoConfig = {
      ...baseBuildingInfoConfig,
      street: addr.street?.value || '',
      district: addr.district.value || '',
      estate: addr.estate?.value || '',
      phase: addr.phase?.value || '',
      building: addr.building.value || '',
    };
    const streetNo = await fetchStreetNo(config);
    addresses[i] = { ...addr, streetNo: streetNo[0] || undefined };
  }
  return addresses;
};

const getAddrFromEstate = async (
  building: AddressAttribute,
  estate: AddressAttribute,
  street: AddressAttribute[],
  region: AddressAttribute,
  district: AddressAttribute,
) => {
  let addr: Address = {
    building: building,
    region: region,
    estate: estate,
    district: district,
    street: undefined,
  };
  if (street.length > 0) {
    const config = {
      ...baseBuildingInfoConfig,
      building: building.value,
      zone: region.value,
      district: district.value,
      estate: estate.value,
    };
    const streetResult = await fetchStreet(config);
    if (streetResult) addr = { ...addr, street: streetResult[0] };
  }

  // Check Phase
  const config = {
    ...baseBuildingInfoConfig,
    district: district.value,
    estate: estate.value,
  };
  const phases = await fetchPhase(config);
  if (phases) {
    for (const phase of phases) {
      const buildingConfig: BuildingConfig = {
        ...baseBuildingConfig,
        zone: region.value,
        district: district.value,
        estate_name: estate.value,
        phase: phase.value,
      };
      const result = await fetchBuilding(buildingConfig);
      if (result && result.find((attr) => isEqual(attr, building))) {
        addr = {
          ...addr,
          phase: phase,
        };
        break;
      }
    }
  }
  await new Promise((r) => setTimeout(r, 1000)); // To prevent getting banned from HK post
  return addr;
};
