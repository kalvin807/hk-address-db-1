exports.up = function (knex) {
  return knex.schema
    .createTable('buildings', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable();
      table.string('zh_name').notNullable();
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('buildingLocations', (table) => {
      // Same "building" can appear in different district,street > Generic building name
      table.increments('id').primary();
      table.integer('building').unsigned();
      table.foreign('building').references('buildings.id');
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
      table.integer('street').unsigned();
      table.foreign('street').references('streets.id');
      table.integer('streetNo').unsigned();
      table.foreign('streetNo').references('streetNos.id');
      table.integer('estate').unsigned();
      table.foreign('estate').references('estates.id');
      table.integer('phase').unsigned();
      table.foreign('phase').references('phases.id');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.index(['building', 'district', 'street', 'streetNo', 'estate', 'phase'], 'buildingLocation_index');
      table.index('building');
      table.index('district');
      table.index('street');
      table.index('estate');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('buildingLocations').dropTable('buildings');
};
