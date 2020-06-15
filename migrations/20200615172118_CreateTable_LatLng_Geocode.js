exports.up = function (knex) {
  return knex.schema
    .createTable('latlngs', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.float('lat');
      table.float('lng');
      table.json('raw');
      table.text('remark');
    })
    .createTable('geocodes', (table) => {
      table.increments('id').primary();
      table.integer('buildingLocation').unsigned().notNullable();
      table.foreign('buildingLocation').references('buildingLocations.id');
      table.integer('latlng').unsigned().notNullable();
      table.foreign('latlng').references('latlngs.id');
      table.string('result', 255);
      table.text('remark');
      table.boolean('match');
    });
};

exports.down = function (knex) {
  return knex.schema.dropTable('geocodes').dropTable('latlngs');
};
