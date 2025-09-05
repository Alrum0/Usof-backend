require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
});
connection.query(
  `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`,
  (err) => {
    if (err) throw err;
  }
);

const file = fs.readFileSync('./db.sql', 'utf8');
const sql = `USE \`${process.env.DB_NAME}\`;\n${file}`;

connection.query(sql, (err) => {
  if (err) throw err;
  console.log('Database initialized');
  connection.end();
});

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

module.exports = db;
