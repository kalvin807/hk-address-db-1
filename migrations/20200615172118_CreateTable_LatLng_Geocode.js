exports.up = function (knex) {
  return knex.schema
    .createTable('latlngs', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.float('lat');
      table.float('lng');
      table.json('raw');
      table.text('remark');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('geocodes', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.integer('latlng').unsigned().notNullable();
      table.foreign('latlng').references('latlngs.id');
      table.string('result');
      table.text('remark');
      table.boolean('match');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.index('buildingLocation');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('geocodes').dropTable('latlngs');
};
