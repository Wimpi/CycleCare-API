const { createPool } = require('mysql2/promise');
const {
   DB_HOST,
   DB_NAME,
   DB_PASSWORD,
   DB_PORT,
   DB_USER 
  } = require("../configuration/database_config");

const pool = createPool({ 
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USER,
});

module.exports = { pool };