exports.up = function (knex) {
  return knex.schema
    .createTable('floors', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable(); // 二樓 vs 2樓
      table.string('zh_name').notNullable();
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('units', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable();
      table.string('zh_name').notNullable();
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('addresses', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.integer('floor').unsigned();
      table.foreign('floor').references('floors.id');
      table.integer('unit').unsigned();
      table.foreign('unit').references('units.id');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));

      table.index(['buildingLocation', 'floor', 'unit'], 'address_index');
    })
    .createTable('validAddresses', (table) => {
      table.increments('id').primary();
      table.string('en_name');
      table.string('zh_name');
      table.integer('address').unsigned().notNullable();
      table.foreign('address').references('addresses.id');
      table.text('remark');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.index('address');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('validAddresses').dropTable('addresses').dropTable('units').dropTable('floors');
};
