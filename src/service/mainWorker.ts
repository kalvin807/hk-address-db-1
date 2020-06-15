import { Address, AddressAttribute, Building } from '../model/addressModel';
import { BuildingConfig, DistrictConfig, baseBuildingConfig, baseBuildingInfoConfig } from '../model/hkPostApiModel';
import { fetchAllFromHKPost, fetchBuilding, fetchEstate, fetchStreet } from './hkPostFetcher';
import { getGeocoding, getLatLng } from './geo';

import Knex from 'knex';
import { getUniqueAddresses } from './address';
import { selectOrInsertItem } from './db';

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

  for (const addr of buildingAddr) {
    //Fetch geo info from pokeguide api
    addr.latlng = await getLatLng(addr);
    addr.geocode = await getGeocoding(addr);
    // Upsert static Data
    const region = await selectOrInsertItem(db, 'regions', addr.region);
    const district = await selectOrInsertItem(db, 'districts', addr.district);
    const street = await selectOrInsertItem(db, 'streets', addr.street);
    const streetNo = await selectOrInsertItem(db, 'streetNos', addr.streetNo);
    const estate = await selectOrInsertItem(db, 'estates', addr.estate);
    const phase = await selectOrInsertItem(db, 'phases', addr.phase);
    const building = await selectOrInsertItem(db, 'buildings', addr.building);
    // Upsert relationship
    const districtLoc = await selectOrInsertItem(db, 'districtLocations', {
      district: district,
      region: region,
    });
    const streetLoc =
      street && district
        ? await selectOrInsertItem(db, 'streetLocations', {
            district: district,
            street: street,
          })
        : undefined;
    const streetNoLoc =
      streetLoc && streetNo
        ? await selectOrInsertItem(db, 'streetNoLocations', {
            streetLocation: streetLoc,
            streetNo: streetNo,
          })
        : undefined;
    const estateLoc =
      estate && district
        ? await selectOrInsertItem(db, 'estateLocations', {
            estate: estate,
            district: district,
            street: street,
            streetNo: streetNo,
          })
        : undefined;
    const phaseLoc =
      phase && estateLoc
        ? await selectOrInsertItem(db, 'phaseLocations', {
            phase: phase,
            estateLocation: estateLoc,
          })
        : undefined;
    const buildingLoc = await selectOrInsertItem(db, 'buildingLocations', {
      building: building,
      district: district,
      street: street,
      streetNo: streetNo,
      estate: estate,
      phase: phase,
    });
    const latlng = await selectOrInsertItem(db, 'latlngs', {
      buildingLocation: buildingLoc,
      lat: addr.latlng.lat,
      lng: addr.latlng.lng,
      raw: addr.latlng.raw,
      remark: addr.latlng.remark,
    });
    const geocode = await selectOrInsertItem(db, 'geocodes', {
      buildingLocation: buildingLoc,
      latlng: latlng,
      result: addr.geocode?.result,
      remark: addr.geocode?.remark,
      match: addr.geocode?.match,
    });
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
