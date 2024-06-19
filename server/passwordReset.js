const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const randomstring = require('randomstring');
const twilio = require('twilio');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/send-otp', async (req, res) => {
    const { userId, phoneNumber } = req.body;
    const generatedOtp = randomstring.generate({ length: 6, charset: 'numeric' });

    try {
        const message = await client.messages.create({
            body: `Your OTP for password reset is: ${generatedOtp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        console.log(`Generated OTP for ${userId}: ${generatedOtp}`);
        console.log('OTP sent via Twilio SID:', message.sid);
        return res.status(200).json({ message: 'OTP sent successfully', generatedOtp, messageSid: message.sid });
    } catch (error) {
        console.error('Error sending OTP via Twilio:', error);
        return res.status(500).json({ message: 'Failed to send OTP' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { userId, otp, newPassword, generatedOtp, messageSid } = req.body;

    console.log(`Received userId: ${userId}`);
    console.log(`Received otp: ${otp}`);
    console.log(`Received newPassword: ${newPassword}`);
    console.log(`Received generatedOtp: ${generatedOtp}`);
    console.log(`Received messageSid: ${messageSid}`);

    try {
        if (otp !== generatedOtp || !messageSid) {
            return res.status(400).json({ message: 'Invalid OTP or Message SID' });
        }

        pool.query('UPDATE adminlogin SET password = ? WHERE username = ?', [newPassword, userId], (error, results) => {
            if (error) {
                console.error('Error updating password:', error);
                return res.status(500).json({ message: 'Failed to update password' });
            }

            if (results.affectedRows === 1) {
                console.log('Password updated successfully in the database');
                return res.status(200).json({ message: 'Password updated successfully' });
            } else {
                console.error('Failed to update password, no rows affected');
                return res.status(400).json({ message: 'Failed to update password' });
            }
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
