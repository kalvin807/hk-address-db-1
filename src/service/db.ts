/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BaseSchema } from '../model/dbSchemaModel';
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

export const insertItem = async (db: Knex, table: string, item: BaseSchema): Promise<any> => {
  return await db(table)
    .insert(item)
    .then((result) => result[0])
    .catch((err) => {
      console.error(err.code);
      return undefined;
    });
};

export const findItem = async (db: Knex, table: string, filter: BaseSchema): Promise<any> => {
  filter = removeEmpty(filter as Record<string, never>);
  return await db
    .select()
    .from(table)
    .where(filter)
    .first()
    .then((result) => result)
    .catch((err) => {
      console.error(err.code);
      return undefined;
    });
};

export const selectOrInsertItem = async (db: Knex, table: string, item: BaseSchema): Promise<any> => {
  const result = await findItem(db, table, item);
  return result ? result.id : insertItem(db, table, item);
};

const removeEmpty = (obj: Record<string, never>): Record<string, never> =>
  Object.entries(obj).reduce((a: Record<string, never>, [k, v]) => (v === undefined ? a : ((a[k] = v), a)), {});
