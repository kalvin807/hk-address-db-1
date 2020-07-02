exports.up = function (knex) {
  return knex.schema
    .createTable('streets', (table) => {
      table.increments('id').primary();
      table.string('en_name').notNullable();
      table.string('zh_name').notNullable();
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('streetNos', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
    })
    .createTable('streetLocations', (table) => {
      // Same street can appear in different district 聯安街
      table.increments('id').primary();
      table.integer('street').unsigned().notNullable();
      table.foreign('street').references('streets.id');
      table.integer('district').unsigned().notNullable();
      table.foreign('district').references('districts.id');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.index('district');
      table.index('street');
    })
    .createTable('streetNoLocations', (table) => {
      table.increments('id').primary();
      table.integer('streetLocation').unsigned().notNullable();
      table.foreign('streetLocation').references('streetLocations.id');
      table.integer('streetNo').unsigned().notNullable();
      table.foreign('streetNo').references('streetNos.id');
      table.timestamp('created_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
      table.timestamp('updated_at').notNull().defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
      table.index('streetLocation');
      table.index('streetNo');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('streetNoLocations')
    .dropTable('streetLocations')
    .dropTable('streetNos')
    .dropTable('streets');
};
