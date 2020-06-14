import { Address, AddressAttribute, Building } from '../model/address';
import { BuildingOption, baseBuildingInfoOption, baseBuildingOption } from '../model/requestOption';
import { fetchBuilding, fetchPhase, fetchStreet } from './fetcher';

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
    console.log(building)
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
      ...baseBuildingInfoOption,
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
    ...baseBuildingInfoOption,
    district: district.value,
    estate: estate.value,
  };
  const phases = await fetchPhase(config);
  if (phases) {
    for (const phase of phases) {
      const buildingConfig: BuildingOption = {
        ...baseBuildingOption,
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
