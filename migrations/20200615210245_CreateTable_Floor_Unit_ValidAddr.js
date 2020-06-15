exports.up = function (knex) {
  return knex.schema
    .createTable('floors', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable(); // 二樓 vs 2樓
      table.string('zh_name').notNullable();
    })
    .createTable('units', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable();
      table.string('zh_name').notNullable();
    })
    .createTable('addresses', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.integer('floor').unsigned();
      table.foreign('floor').references('floors.id');
      table.integer('unit').unsigned();
      table.foreign('unit').references('units.id');
    })
    .createTable('validAddresses', (table) => {
      table.increments('id').primary();
      table.string('en_name');
      table.string('zh_name');
      table.integer('address').unsigned().notNullable();
      table.foreign('address').references('addresses.id');
      table.text('remark');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('validAddresses').dropTable('addresses').dropTable('units').dropTable('floors');
};
