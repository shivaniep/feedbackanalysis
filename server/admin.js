const mysql = require('mysql');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',       
  password: 'root123',
  database: 'db'
});

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, values, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = {
  query
};



