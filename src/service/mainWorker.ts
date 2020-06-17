import Knex from 'knex';
import asyncPool from 'tiny-async-pool';

import { Address, AddressAttribute, Building } from '../model/addressModel';
import { BuildingConfig, DistrictConfig, baseBuildingConfig, baseBuildingInfoConfig } from '../model/hkPostApiModel';
import { Geocode, LatLng } from '../model/geoModel';
import { fetchBuilding, fetchDistrict, fetchFloor, fetchUnit, fetchValidAddr } from './hkPostFetcher';
import { getGeocoding, getLatLng } from './geo';
import { getUniqueAddresses } from './address';
import { selectOrInsertItem, findItemId } from './db';

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
  const districtsByRegion = await Promise.all(districtConfigs.map((config) => fetchDistrict(config)));

  // Buildings
  for (let i = 0; i < districtsByRegion.length; i++) {
    const region = regions[i];
    const districts = districtsByRegion[i];
    if (districts) {
      for (const district of districts) {
        if (!findItemId(db, 'districts', district)) {
          console.log(district.en_name);
          const buildings = await getBuildings(region, district);
          console.log(`${buildings.length} of buildings found.`);
          // For each building fetch information with the building value
          // Convert building to unique building address
          const buildingAddrDistrict = await Promise.all(buildings.map((building) => getUniqueAddresses(building)));
          const buildingAddr = (await buildingAddrDistrict).flat();
          console.log(`${buildingAddr.length} of unique building location found.`);

          const buildingsLoc: (number | undefined)[] = [];
          for (const addr of buildingAddr) {
            const loc = await loadBuildingInfoToDB(db, addr);
            buildingsLoc.push(loc);
          }

          await fetchLoadPokeguideInfos(db, buildingAddr, buildingsLoc);
          // Fetch floor, unit and valid addr and load into db

          for (let i = 0; i < buildingsLoc.length; i++) {
            const loc = buildingsLoc[i];
            if (loc) await fetchLoadFloorUnitValidAddr(db, buildingAddr[i], loc);
            const count = await db('addresses').count('id');
            console.log(`Finished with ${count[0]['count(`id`)']} addresses fetched and loaded.`);
          }
        }
      }
    }
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

const loadBuildingInfoToDB = async (db: Knex, addr: Address): Promise<number | undefined> => {
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

  return buildingLoc;
};

const fetchLoadPokeguideInfos = async (
  db: Knex,
  buildingAddr: Address[],
  buildingsLoc: (number | undefined)[],
): Promise<void> => {
  // Fetch pokeguide Info, pool
  const latlngs = await asyncPool(50, buildingAddr, getLatLng);
  const geocodes = await asyncPool(50, buildingAddr, getGeocoding);

  for (let i = 0; i < buildingsLoc.length; i++) {
    const loc = buildingsLoc[i];
    if (loc) await loadPokeguideInfo(db, latlngs[i], geocodes[i], loc);
  }
};

const loadPokeguideInfo = async (db: Knex, latlng: LatLng, geocode: Geocode | undefined, loc: number) => {
  const latlngRow = await selectOrInsertItem(db, 'latlngs', {
    buildingLocation: loc,
    lat: latlng.lat,
    lng: latlng.lng,
    raw: latlng.raw,
    remark: latlng.remark,
  });
  //Geocode
  await selectOrInsertItem(db, 'geocodes', {
    buildingLocation: loc,
    latlng: latlngRow,
    result: geocode?.result,
    remark: geocode?.remark,
    match: geocode?.match,
  });
};

const fetchLoadFloorUnitValidAddr = async (db: Knex, addr: Address, buildingLoc: number) => {
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
  const units = await asyncPool(
    10,
    floors.map((f) => ({ ...config, floor: f.value })),
    fetchUnit,
  );
  const addrRow: any = [];
  if (floors.length > 0)
    for (let f = 0; f < floors.length; f++) {
      const floor = floors[f];
      if (units[f].length > 0)
        for (const unit of units[f]) {
          addrRow.push(await loadAddress(db, floor, unit, buildingLoc));
        }
      else addrRow.push(await loadAddress(db, floor, undefined, buildingLoc));
    }
  else addrRow.push(await loadAddress(db, undefined, undefined, buildingLoc));

  const validAddrConfig = addrRow.map((floorUnit: { floor: AddressAttribute; unit: AddressAttribute }) => ({
    ...addr,
    floor: floorUnit.floor,
    unit: floorUnit.unit,
  }));

  const validAddrs = await asyncPool(100, validAddrConfig, fetchValidAddr);

  for (let i = 0; i < validAddrs.length; i++) {
    const validAddr = validAddrs[i];
    if (validAddr)
      await selectOrInsertItem(db, 'validAddresses', {
        address: addrRow[i].addrRow,
        ...validAddr,
      });
  }
};

// Load address into db
const loadAddress = async (
  db: Knex,
  floor: AddressAttribute | undefined,
  unit: AddressAttribute | undefined,
  loc: number,
) => {
  const floorRow = await selectOrInsertItem(db, 'floors', floor);
  const unitRow = await selectOrInsertItem(db, 'units', unit);
  const addrRow = await selectOrInsertItem(db, 'addresses', {
    buildingLocation: loc,
    floor: floorRow,
    unit: unitRow,
  });
  return {
    floor: floor,
    unit: unit,
    addrRow: addrRow,
  };
};

export default mainWorker;
