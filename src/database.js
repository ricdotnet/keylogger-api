import mysql from 'mysql2/promise';

const env = process.env;

const access = {
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  host: env.DB_HOST,
  port: env.DB_PORT,
  connectionLimit: 5,
};

const db = mysql.createPool(access);

export { db };