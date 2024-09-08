import mysql from 'mysql2/promise';

const env = process.env;

let db;

(async () => {
  db = await mysql.createConnection(env.DB_STRING);
})();

export { db };