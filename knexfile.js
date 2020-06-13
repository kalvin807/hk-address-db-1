/* eslint-disable @typescript-eslint/no-var-requires */
// Update with your config settings.
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql',
    connection: {
      hostname: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
  },
};
