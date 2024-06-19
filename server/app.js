const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./admin');
const path = require('path');
const passwordResetRouter = require('./passwordReset');
const { getFacultyAnalysis } = require('./plotdb.js');
const { getMostFrequentWords } = require('./wordUtil');
require('dotenv').config();


const { submitForm, getUnprocessedFeedbackData, insertAnalysisResults, markFeedbackAsProcessed } = require('./formdb'); 
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/adminlogin.html'));
});

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
  credentials: true, 
}));


app.use(express.json());

app.post('/submit-form', cors(), async (req, res) => {
  const { semester, faculty_id, teaching, coursecontent, examination, labwork, comments } = req.body;

  try {
    await submitForm(semester, faculty_id, teaching, coursecontent, examination, labwork, comments);
    console.log('Form data stored successfully');
    res.send('Form data stored successfully');
  } catch (error) {
    console.error('Error storing form data: ' + error);
    res.status(500).send('Error storing form data');
  }
});

app.get('/submit-form', (req, res) => {
  res.send('This is a GET request to /submit-form');
});

app.get('/analyze-feedback', async (req, res) => {
  try {
    console.log('Fetching unprocessed feedback data...');
    getUnprocessedFeedbackData((error, feedbackData) => {
      if (error) {
        console.error('Error fetching feedback data:', error);
        res.status(500).send('Error fetching feedback data');
        return;
      }

      if (feedbackData.length === 0) {
        res.send('No unprocessed feedback data available');
        return;
      }

      const feedbackDataJson = JSON.stringify(feedbackData);
      console.log('Sending feedback data to Python script:', feedbackDataJson);

      const pythonProcess = spawn('python', ['analyze.py', feedbackDataJson]);

      pythonProcess.stdout.on('data', (data) => {
        try {
          const analysisResults = JSON.parse(data.toString());
          if (analysisResults.error) {
            console.error('Error from Python script:', analysisResults.error);
            res.status(500).send('Error analyzing feedback: ' + analysisResults.error);
          } else {
            insertAnalysisResults(analysisResults, (insertError) => {
              if (insertError) {
                console.error('Error storing analysis results:', insertError);
                res.status(500).send('Error storing analysis results');
              } else {
                const feedbackIds = feedbackData.map(feedback => feedback.id);
                markFeedbackAsProcessed(feedbackIds, (markError) => {
                  if (markError) {
                    console.error('Error marking feedback as processed:', markError);
                    res.status(500).send('Error marking feedback as processed');
                  } else {
                    console.log('Analysis results stored and feedback marked as processed successfully');
                    res.send('Analysis results stored and feedback marked as processed successfully');
                  }
                });
              }
            });
          }
        } catch (parseError) {
          console.error('Error parsing JSON from Python script:', parseError);
          res.status(500).send('Error parsing JSON from Python script');
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Error from Python script:', data.toString());
        res.status(500).send('Error analyzing feedback');
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`Python script exited with code ${code}`);
          res.status(500).send(`Python script exited with code ${code}`);
        }
      });
    });
  } catch (error) {
    console.error('Error in analyze-feedback route:', error);
    res.status(500).send('Error analyzing feedback');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const query = 'SELECT * FROM adminlogin WHERE username = ? AND password = ?';
    const results = await db.query(query, [username, password]);

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.use('/password-reset', passwordResetRouter);

app.get('/getFacultyAnalysis', (req, res) => {
  const facultyId = req.query.faculty_id;

  if (!facultyId) {
      return res.status(400).json({ error: 'Missing faculty_id parameter' });
  }

  getFacultyAnalysis(facultyId, (error, analysis) => {
      if (error) {
          console.error('Error fetching faculty analysis:', error);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log(`Faculty ID: ${facultyId}, Analysis:`, analysis);
      res.json(analysis);
  });
});

app.get('/getWordFrequencies', (req, res) => {
  const facultyId = req.query.faculty_id;

  getMostFrequentWords(facultyId, (err, words) => {
      if (err) {
          console.error('Error fetching frequent words:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.json(words);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
