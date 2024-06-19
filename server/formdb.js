const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'db'
});

function submitForm(semester, faculty_id, teaching, coursecontent, examination, labwork, comments) {
    return new Promise((resolve, reject) => {
        pool.query('INSERT INTO feedback (semester, faculty_id, teaching, coursecontent, examination, labwork, comments) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [semester, faculty_id, teaching, coursecontent, examination, labwork, comments], 
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

function getUnprocessedFeedbackData(callback) {
    pool.query('SELECT * FROM feedback WHERE processed = FALSE', (error, results) => {
        if (error) {
            console.error('Error executing SQL query:', error);
            callback(error, null);
        } else {
            console.log('SQL query executed successfully:', results);
            callback(null, results);
        }
    });
}

function insertAnalysisResults(analysisResults, callback) {
    const queries = analysisResults.map(result => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO analysis (faculty_id, output_label) VALUES (?, ?)';
            pool.query(query, [result.faculty_id, result.output_label], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    });

    Promise.all(queries)
        .then(() => {
            console.log('All analysis results stored successfully');
            callback(null);
        })
        .catch(error => {
            console.error('Error storing analysis results:', error);
            callback(error);
        });
}

function markFeedbackAsProcessed(feedbackIds, callback) {
    const query = 'UPDATE feedback SET processed = TRUE WHERE id IN (?)';
    pool.query(query, [feedbackIds], (error, results) => {
        if (error) {
            console.error('Error marking feedback as processed:', error);
            callback(error);
        } else {
            console.log('Feedback marked as processed successfully');
            callback(null);
        }
    });
}

module.exports = { submitForm, getUnprocessedFeedbackData, insertAnalysisResults, markFeedbackAsProcessed };
