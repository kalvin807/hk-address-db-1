/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AddressAttribute } from '../model/address';
import Knex from 'knex';

export const createClient = (): Knex =>
  Knex({
    client: 'mysql',
    connection: {
      host: process.env.DB_HOST!,
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_NAME!,
      charset: 'utf8mb4',
    },
  });

export const insertItem = async (db: Knex, table: string, item: AddressAttribute) => {
  return await db(table)
    .insert(item)
    .then((value) => console.log(`Inserted ${item.en_name} to ${value}`))
    .catch((err) => console.error(err.code));
};
