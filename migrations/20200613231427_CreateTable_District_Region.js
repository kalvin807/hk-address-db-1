exports.up = function (knex) {
  return knex.schema
    .createTable('regions', (table) => {
      table.increments('id').primary();
      table.string('en_name', 100).unique().notNullable();
      table.string('zh_name', 100).unique().notNullable();
    })
    .createTable('districts', (table) => {
      table.increments('id').primary();
      table.string('en_name', 100).unique().notNullable();
      table.string('zh_name', 100).unique().notNullable();
    })
    .createTable('districtLocations', (table) => {
      table.increments('id').primary();
      table.integer('district').unsigned().notNullable().unique();
      table.foreign('district').references('districts.id');
      table.integer('region').unsigned().notNullable();
      table.foreign('region').references('regions.id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('districtLocations').dropTable('districts').dropTable('regions');
};
