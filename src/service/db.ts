/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BaseSchema, GeoSchema, RelationshipSchema } from '../model/dbSchemaModel';

import Knex from 'knex';
import { removeEmpty } from '../utils/helper';

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

export const insertItem = async (
  db: Knex,
  table: string,
  item: BaseSchema | RelationshipSchema,
): Promise<number | undefined> => {
  return await db(table)
    .insert(item)
    .then((result) => result[0])
    .catch((err) => {
      console.error(err.code);
      return undefined;
    });
};

export const findItemId = async (
  db: Knex,
  table: string,
  filter: BaseSchema | RelationshipSchema,
): Promise<number | undefined> => {
  return await db
    .select()
    .from(table)
    .where(filter)
    .first()
    .then((result) => (result?.id ? result.id : result))
    .catch((err) => {
      console.error(err.code);
      return undefined;
    });
};

export const selectOrInsertItem = async (
  db: Knex,
  table: string,
  item: BaseSchema | RelationshipSchema | GeoSchema | undefined,
): Promise<number | undefined> => {
  if (!item) return undefined;
  item = { ...item, value: undefined };
  item = removeEmpty(item as Record<string, never>);
  const result = await findItemId(db, table, item);
  return result ? result : insertItem(db, table, item);
};
