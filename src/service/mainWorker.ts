import { DistrictOption, baseOption } from '../model/requestOption';

import { AddressAttribute } from '../model/address';
import Knex from 'knex';
import { fetchAllFromHKPost } from './fetcher';
import { insertItem } from './db';

const mainWorker = async (db: Knex) => {
  // Regions
  const regions: AddressAttribute[] = [
    { value: '1', en_name: 'HONG KONG', zh_name: '香港' },
    { value: '2', en_name: 'KOWLOON', zh_name: '九龍' },
    { value: '3', en_name: 'NEW TERRITORIES', zh_name: '新界' },
  ];

  await Promise.all(regions.map((r) => insertItem(db, 'regions', r)));

  // Fetch all districts
  const districtConfigs: DistrictOption[] = regions.map((region) => ({
    ...baseOption,
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

  // Fetch all building of each district

  // Each building fetch its related info

  // Form full addr

  await db.destroy();
};

export default mainWorker;
