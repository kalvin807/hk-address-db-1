import { Address, AddressAttribute, Building } from '../model/addressModel';
import { BuildingConfig, DistrictConfig, baseBuildingConfig, baseBuildingInfoConfig } from '../model/configModel';
import { fetchAllFromHKPost, fetchBuilding, fetchEstate, fetchStreet } from './fetcher';
import { insertItem, selectOrInsertItem } from './db';

import { BaseSchema } from '../model/dbSchemaModel';
import Knex from 'knex';
import { add } from 'lodash';
import { getUniqueAddresses } from './address';

const mainWorker = async (db: Knex): Promise<void> => {
  // Regions
  const regions: AddressAttribute[] = [
    { value: '1', en_name: 'HONG KONG', zh_name: '香港' },
    // { value: '2', en_name: 'KOWLOON', zh_name: '九龍' },
    // { value: '3', en_name: 'NEW TERRITORIES', zh_name: '新界' },
    // FIXME: DEBUG USE
  ];

  // Districts
  const districtConfigs: DistrictConfig[] = regions.map((region) => ({
    lang1: 'en_US',
    zone_value: Number(region.value),
  }));
  const districtsUrl = process.env.DISTRICT_URL || ' ';
  const districts = await fetchAllFromHKPost(districtsUrl, districtConfigs);

  // Buildings
  let buildings: Building[] = [];
  for (let i = 0; i < districts.length; i++) {
    const region = regions[i];
    const district = districts[i];
    if (district)
      for (const dist of district) {
        if (dist.en_name === 'CHAI WAN') {
          // FIXME: DEBUG USE
          const tmp = await getBuildings(region, dist);
          const tmpBuilding: Building[] = [];
          // For each building fetch information with the building value
          for (const b of tmp) tmpBuilding.push(await fetchBuildingInfo(b));
          buildings = buildings.concat(tmpBuilding);
          break; // FIXME: DEBUG USE
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

  // TODO: Add pokeguide api

  // TODO: load into db
  for (const addr of buildingAddr) {
    const region = await selectOrInsertItem(db, 'regions', addr.region as BaseSchema);
    const district = await selectOrInsertItem(db, 'districts', { ...addr.district, region: region } as BaseSchema);
    const street = addr.street
      ? await selectOrInsertItem(db, 'streets', { ...addr.street, district: district } as BaseSchema)
      : undefined;
    const streetNo = addr.streetNo
      ? await selectOrInsertItem(db, 'streetNos', { ...addr.streetNo, street: street } as BaseSchema)
      : undefined;
    const estate = addr.estate
      ? await selectOrInsertItem(db, 'estates', { ...addr.estate, district: district, street: street } as BaseSchema)
      : undefined;
    const phase = addr.phase
      ? await selectOrInsertItem(db, 'phases', { ...addr.phase, estate: estate } as BaseSchema)
      : undefined;
  }

  await db.destroy();
};

const getBuildings = async (region: AddressAttribute, district: AddressAttribute) => {
  const config: BuildingConfig = {
    ...baseBuildingConfig,
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

export default mainWorker;
