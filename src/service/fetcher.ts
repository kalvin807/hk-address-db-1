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
