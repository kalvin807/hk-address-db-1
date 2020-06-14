exports.up = function (knex) {
  return knex.schema
    .createTable('estates', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
      table.string('value', 200).notNullable();
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
      table.integer('street').unsigned();
      table.foreign('street').references('streets.id');
    })
    .createTable('phases', (table) => {
      table.increments('id').primary();
      table.string('en_name', 200).notNullable();
      table.string('zh_name', 200).notNullable();
      table.string('value', 200).notNullable();
      table.integer('estate').unsigned().notNullable();
      table.foreign('estate').references('estates.id');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('phases').dropTable('estates');
};
