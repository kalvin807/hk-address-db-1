import { Address, AddressAttribute, Building } from '../model/addressModel';
import { BuildingConfig, BuildingInfoConfig, baseBuildingConfig, baseBuildingInfoConfig } from '../model/configModel';
import { fetchBuilding, fetchPhase, fetchStreet, fetchStreetNo } from './fetcher';

import isEqual from 'lodash/isEqual';

export const getUniqueAddresses = async (building: Building) => {
  const addresses: Address[] = [];
  const buildingInfo: AddressAttribute = {
    zh_name: building.zh_name,
    en_name: building.en_name,
    value: building.value,
  };
  if (!building.estate || building.estate.length < 1) {
    // Not a building from estate
    building.street.forEach((street) => {
      addresses.push({
        building: buildingInfo,
        region: building.region,
        estate: undefined,
        district: building.district,
        street: street,
      });
    });
  } else {
    for (const estate of building.estate) {
      const addr = await getAddrFromEstate(buildingInfo, estate, building.street, building.region, building.district);
      if (addr) addresses.push(addr);
    }
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
  return addr;
};
