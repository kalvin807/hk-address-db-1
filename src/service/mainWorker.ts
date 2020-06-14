import { Address, AddressAttribute, Building } from '../model/address';
import { BuildingOption, DistrictOption, baseBuildingInfoOption, baseBuildingOption } from '../model/requestOption';
import { fetchAllFromHKPost, fetchBuilding, fetchEstate, fetchStreet } from './fetcher';

import Knex from 'knex';
import { getUniqueAddresses } from './address';
import { insertItem } from './db';

const mainWorker = async (db: Knex): Promise<void> => {
  // Regions
  const regions: AddressAttribute[] = [
    { value: '1', en_name: 'HONG KONG', zh_name: '香港' },
    // { value: '2', en_name: 'KOWLOON', zh_name: '九龍' },
    // { value: '3', en_name: 'NEW TERRITORIES', zh_name: '新界' },
  ];

  await Promise.all(regions.map((r) => insertItem(db, 'regions', r)));

  // Districts
  const districtConfigs: DistrictOption[] = regions.map((region) => ({
    lang1: 'en_US',
    zone_value: Number(region.value),
  }));
  const districtsUrl = process.env.DISTRICT_URL || ' ';
  const districts = await fetchAllFromHKPost(districtsUrl, districtConfigs);
  await Promise.all(
    districts
      .map((region, idx) => {
        return region?.map((district) => {
          const tmp = { ...district, region: idx + 1 };
          return insertItem(db, 'districts', tmp);
        });
      })
      .flat(),
  );

  // Buildings
  let buildings: Building[] = [];
  for (let i = 0; i < districts.length; i++) {
    const region = regions[i];
    const district = districts[i];
    if (district)
      for (const dist of district) {
        if (dist.en_name === 'CHAI WAN') {
          const tmp = await getBuildings(region, dist);
          const tmpBuilding: Building[] = [];
          // For each building fetch information with the building value
          for (const b of tmp) tmpBuilding.push(await fetchBuildingInfo(b));
          buildings = buildings.concat(tmpBuilding);
        }
      }
  }
  // For each building fetch information with the building value
  // Convert building to unique building address
  let buildingAddr: Address[] = [];
  for (const building of buildings) {
    const tmp = await getUniqueAddresses(building);
    buildingAddr = buildingAddr.concat(tmp);
  }

  console.log(buildingAddr);
  await db.destroy();
};

const getBuildings = async (region: AddressAttribute, district: AddressAttribute) => {
  const config: BuildingOption = {
    ...baseBuildingOption,
    zone: region.value,
    district: district.value,
  };
  const fetchResult = await fetchBuilding(config);
  let buildings: Building[] = [];
  if (fetchResult) {
    buildings = fetchResult.map((result) => {
      return {
        ...result,
        region: region,
        district: district,
      } as Building;
    });
  }

  return buildings;
};

const fetchBuildingInfo = async (building: Building) => {
  const baseConfig = {
    ...baseBuildingInfoOption,
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

export default mainWorker;
