/* eslint-disable @typescript-eslint/no-var-requires */
// Update with your config settings.
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4',
    },
    pool: {
      min: 0,
      max: 10,
      idleTimeoutMillis: 5000,
    },
  },
};
