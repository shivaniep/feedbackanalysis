const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'db'
});

function getFacultyAnalysis(facultyId, callback) {
    const query = `
        SELECT 
            output_label, 
            COUNT(*) AS count 
        FROM 
            analysis 
        WHERE 
            faculty_id = ? 
        GROUP BY 
            output_label
    `;
    pool.query(query, [facultyId], (error, results) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, results);
    });
}

module.exports = { getFacultyAnalysis };
