import { Address, AddressAttribute, Building } from '../model/addressModel';
import { BuildingConfig, baseBuildingConfig, baseBuildingInfoConfig, DistrictConfig } from '../model/hkPostApiModel';
import { fetchBuilding, fetchFloor, fetchUnit, fetchValidAddr, fetchDistrict } from './hkPostFetcher';
import { getGeocoding, getLatLng } from './geo';

import Knex from 'knex';
import { selectOrInsertItem } from './db';
import { getUniqueAddresses } from './address';

const mainWorker = async (db: Knex): Promise<void> => {
  // Regions
  const regions: AddressAttribute[] = [
    { value: '1', en_name: 'HONG KONG', zh_name: '香港' },
    { value: '2', en_name: 'KOWLOON', zh_name: '九龍' },
    { value: '3', en_name: 'NEW TERRITORIES', zh_name: '新界' },
  ];

  // Districts
  const districtConfigs: DistrictConfig[] = regions.map((region) => ({
    lang1: 'en_US',
    zone_value: Number(region.value),
  }));
  const districtsbyRegion = await Promise.all(districtConfigs.map((config) => fetchDistrict(config)));

  // Buildings
  let buildingPromise: Promise<Building[]>[] = [];
  for (let i = 0; i < districtsbyRegion.length; i++) {
    const region = regions[i];
    const districts = districtsbyRegion[i];
    if (districts) buildingPromise = buildingPromise.concat(districts.map((dist) => getBuildings(region, dist)));
  }
  const buildings = (await Promise.all(buildingPromise)).flat();

  // For each building fetch information with the building value
  // Convert building to unique building address
  let buildingAddr: Address[] = [];
  const addrPromise = buildings.map((building) => getUniqueAddresses(building));
  buildingAddr = buildingAddr.concat((await Promise.all(addrPromise)).flat());

  console.log(`${buildingAddr.length} of unique building found.`);
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
    await selectOrInsertItem(db, 'districtLocations', {
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
    if (streetLoc && streetNo)
      await selectOrInsertItem(db, 'streetNoLocations', {
        streetLocation: streetLoc,
        streetNo: streetNo,
      });
    const estateLoc =
      estate && district
        ? await selectOrInsertItem(db, 'estateLocations', {
            estate: estate,
            district: district,
            street: street,
            streetNo: streetNo,
          })
        : undefined;
    if (phase && estateLoc)
      await selectOrInsertItem(db, 'phaseLocations', {
        phase: phase,
        estateLocation: estateLoc,
      });

    const buildingLoc = await selectOrInsertItem(db, 'buildingLocations', {
      building: building,
      district: district,
      street: street,
      streetNo: streetNo,
      estate: estate,
      phase: phase,
    });
    // Lat Lng
    const latlng = await selectOrInsertItem(db, 'latlngs', {
      buildingLocation: buildingLoc,
      lat: addr.latlng.lat,
      lng: addr.latlng.lng,
      raw: addr.latlng.raw,
      remark: addr.latlng.remark,
    });
    //Geocode
    await selectOrInsertItem(db, 'geocodes', {
      buildingLocation: buildingLoc,
      latlng: latlng,
      result: addr.geocode?.result,
      remark: addr.geocode?.remark,
      match: addr.geocode?.match,
    });
    // Fetch floor, unit and valid addr and load into db
    if (buildingLoc) await loadValidAddr(db, addr, buildingLoc);
  }
  console.log(`Finished with ${db('addresses').count('id')} fetched and loaded.`);
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

const loadValidAddr = async (db: Knex, addr: Address, buildingLoc: number) => {
  const config = {
    ...baseBuildingInfoConfig,
    strno: addr.streetNo?.value || '',
    street: addr.street?.value || '',
    estate: addr.estate?.value || '',
    phase: addr.phase?.value || '',
    building: addr.building.value,
    district: addr.district.value,
  };
  const floors = await fetchFloor(config);
  let floorIdx = 0;
  do {
    config.floor = floors[floorIdx]?.value || '';
    addr.floor = floors[floorIdx] || undefined;
    const units = await fetchUnit(config);
    let unitIdx = 0;
    do {
      addr.unit = units[unitIdx] || undefined;
      const validAddr = await fetchValidAddr(addr);
      // Load address into db
      const floor = await selectOrInsertItem(db, 'floors', addr.floor);
      const unit = await selectOrInsertItem(db, 'units', addr.unit);
      const address = await selectOrInsertItem(db, 'addresses', {
        buildingLocation: buildingLoc,
        floor: floor,
        unit: unit,
      });
      await selectOrInsertItem(db, 'validAddresses', {
        address: address,
        ...validAddr,
      });
      unitIdx++;
    } while (unitIdx < units.length);
    floorIdx++;
  } while (floorIdx < floors.length);
};

export default mainWorker;
