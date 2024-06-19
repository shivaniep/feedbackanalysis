const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'db'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to feedback database');
});

function getMostFrequentWords(facultyId, callback) {
    const query = 'SELECT comments FROM feedback WHERE faculty_id = ?';

    db.query(query, [facultyId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        let wordCount = {};

        results.forEach(row => {
            if (row.comments) {  
                let words = row.comments.split(/\W+/).map(word => word.toLowerCase());
                words.forEach(word => {
                    if (word) {
                        if (wordCount[word]) {
                            wordCount[word]++;
                        } else {
                            wordCount[word] = 1;
                        }
                    }
                });
            }
        });

        let sortedWords = Object.entries(wordCount).sort((a, b) => b[1] - a[1]);

        callback(null, sortedWords);
    });
}

module.exports = { getMostFrequentWords };
