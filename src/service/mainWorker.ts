import { BaseOption, DistrictOption, baseOption } from '../model/requestOption';

import { AddressAttribute } from '../model/address';
import { fetch } from './fetcher';

const fetchAllFromHKPost = async (url: string, configs: BaseOption[]) => {
  const res = configs.map((configs) => {
    return fetch(url, configs);
  });
  const results = await Promise.all(res);
  return results.map((val) => extractFeatures(val));
};

const extractFeatures = (rawStr: string): AddressAttribute[] | undefined => {
  const htmlRegex = /<option value="(.+)">(.*)<.*>/g; // Expected to grep value and the value of the html
  const matchedLines = rawStr.split('\n').map((line) => {
    htmlRegex.lastIndex = 0;
    const matched = htmlRegex.exec(line);
    if (matched) {
      return [matched[1], matched[2]];
    }
  });
  const features = [] as AddressAttribute[];
  const nameRegex = /(.+) &nbsp;\((.+)\)/g; // Expected to get the Eng Name and Chi name in the bracket
  matchedLines.forEach((line) => {
    if (line) {
      nameRegex.lastIndex = 0;
      const names = nameRegex.exec(line[1]);
      if (names)
        features.push({
          value: line[0],
          en_name: names[1],
          zh_name: names[2],
        });
    }
  });
  return features;
};

const mainWorker = async () => {
  // Regions
  const regions: AddressAttribute[] = [
    { value: '1', en_name: 'HONG KONG', zh_name: '香港' },
    { value: '2', en_name: 'KOWLOON', zh_name: '九龍' },
    { value: '3', en_name: 'NEW TERRITORIES', zh_name: '新界' },
  ];

  const districtConfigs: DistrictOption[] = regions.map((region) => ({ ...baseOption, zone_value: Number(region.value) }));
  // Fetch all districts
  const districtsUrl = process.env.DISTRICT_URL || ' ';
  const districts = await fetchAllFromHKPost(districtsUrl, districtConfigs);

  console.log(districts);

  // Fetch all building of each district

  // Each building fetch its related info

  // Form full addr
};
export default mainWorker;
