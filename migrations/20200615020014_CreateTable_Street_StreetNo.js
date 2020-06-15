exports.up = function (knex) {
  return knex.schema
    .createTable('streets', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
    })
    .createTable('streetNos', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
    })
    .createTable('streetLocations', (table) => {
      // Same street can appear in different district 聯安街
      table.increments('id').primary();
      table.integer('street').unsigned().notNullable();
      table.foreign('street').references('streets.id');
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
    })
    .createTable('streetNoLocations', (table) => {
      table.increments('id').primary();
      table.integer('streetLocation').unsigned().notNullable();
      table.foreign('streetLocation').references('streetLocations.id');
      table.integer('streetNo').unsigned().notNullable();
      table.foreign('streetNo').references('streetNos.id');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('streetNoLocations')
    .dropTable('streetLocations')
    .dropTable('streetNos')
    .dropTable('streets');
};
