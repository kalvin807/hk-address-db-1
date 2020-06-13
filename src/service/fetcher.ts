import { AddressAttribute } from '../model/address';
import { BaseOption } from '../model/requestOption';
import axios from 'axios';

export const fetch = async (url: string, options: BaseOption) => {
  url = url + concatOptions(options);
  const res = await axios.get(url);
  return res.data;
};

const concatOptions = (options: BaseOption) => {
  let str = '';
  Object.entries(options).forEach(([key, val]) => {
    const tmp = `${key}=${val.toString()}`;
    str = str + '&' + tmp;
  });
  return str;
};

export const fetchAllFromHKPost = async (url: string, configs: BaseOption[]) => {
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
