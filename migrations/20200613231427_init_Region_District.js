exports.up = function (knex) {
  return knex.schema
    .createTable('regions', (table) => {
      table.increments('id').primary();
      table.string('en_name', 100).unique().notNullable();
      table.string('zh_name', 100).unique().notNullable();
      table.integer('value').notNullable();
    })
    .createTable('districts', (table) => {
      table.increments('id').primary();
      table.string('en_name', 100).unique().notNullable();
      table.string('zh_name', 100).unique().notNullable();
      table.integer('value').notNullable();
      table.integer('region').unsigned().notNullable();
      table.foreign('region').references('regions.id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('districts').dropTable('regions');
};
