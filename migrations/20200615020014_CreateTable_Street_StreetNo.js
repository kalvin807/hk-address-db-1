exports.up = function (knex) {
  return knex.schema
    .createTable('streets', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
      table.string('value', 200).notNullable();
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
    })
    .createTable('streetNos', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable();
      table.string('value', 100).notNullable();
      table.integer('street').unsigned().notNullable();
      table.foreign('street').references('streets.id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('streetNos').dropTable('streets');
};
