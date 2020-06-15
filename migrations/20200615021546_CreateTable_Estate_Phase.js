exports.up = function (knex) {
  return knex.schema
    .createTable('estates', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
    })
    .createTable('phases', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
    })
    .createTable('estateLocations', (table) => {
      table.increments('id').primary();
      table.integer('estate').unsigned().notNullable();
      table.foreign('estate').references('estates.id');
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
      table.integer('street').unsigned();
      table.foreign('street').references('streets.id');
      table.integer('streetNo').unsigned();
      table.foreign('streetNo').references('streetNos.id');
    })
    .createTable('phaseLocations', (table) => {
      table.increments('id').primary();
      table.integer('phase').unsigned().notNullable();
      table.foreign('phase').references('phases.id');
      table.integer('estateLocation').unsigned().notNullable();
      table.foreign('estateLocation').references('estateLocations.id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('phaseLocations').dropTable('estateLocations').dropTable('phases').dropTable('estates');
};
