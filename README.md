# Feedback Analysis

This is a comprehensive portal designed to collect, analyze, and visualize student feedback. The application provides an intuitive interface for students to submit their feedback and offers detailed analysis for administrators, including sentiment analysis, frequently used words, and the ability to export reports as PDFs.

## Features

- **Student Feedback Submission**: Simple forms for students to provide feedback.
- **Sentiment Analysis**: Breaks down feedback into categories such as positive, neutral, and negative.
- **Word Frequency Analysis**: Displays the most frequently used words in student comments.
- **PDF Export**: Allows administrators to export the analysis report as a PDF.
- **User-Friendly Interface**: Easy navigation and visualization of data.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, D3.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL

## Installation

### Prerequisites

- Node.js
- MySQL

### Steps

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/FeedbackHub.git
    cd FeedbackHub
    ```
2. 2. Install the required dependencies:
    ```sh
    npm install
    ```
3. Set up the MySQL database:
    - Create a new database.
    - Import the provided SQL scripts to set up the tables and initial data.
      
4. Set up Twilio API credentials:
    - Replace placeholders in `server/routes.js` with your Twilio Account SID, Auth Token, and phone number.
      
5. Start the server:
    ```sh
    node server/app.js
    ```

6. Open `form.html` in your browser to start using the application.

## Usage

- **Student**: Navigate to the feedback submission form and provide your feedback.
- **Administrator**: Log in to access the dashboard, where you can view sentiment analysis, word frequency, and export the report as a PDF.
