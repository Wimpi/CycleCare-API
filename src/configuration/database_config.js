require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;

module.exports = { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER };
