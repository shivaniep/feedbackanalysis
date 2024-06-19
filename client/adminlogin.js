const endpoints = {
    login: 'http://localhost:3000/login',
    resetPassword: 'http://localhost:3000/password-reset/send-otp',
    verify: 'http://localhost:3000/password-reset/verify-otp'
};

document.getElementById('login').addEventListener('click', async () => {
    const userId = document.getElementById('user-id').value;
    const password = document.getElementById('password').value;

    const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: userId, password: password }),
        credentials: 'include'
    });

    const result = await response.json();

    if (response.status === 200) {
        localStorage.setItem('userId', userId);
        alert('Login successful');
        window.location.href = 'adminDash.html';
    } else {
        alert('Invalid username or password'); 
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordBtn = document.getElementById('reset-password');
    const otpModal = document.getElementById('otpModal');
    const closeBtn = document.getElementById('closeBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');

    resetPasswordBtn.addEventListener('click', function() {
        otpModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        otpModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === otpModal) {
            otpModal.style.display = 'none';
        }
    });

    sendOtpBtn.addEventListener('click', async () => {
        const userId = document.getElementById('user-id').value;
        const phoneNumber = document.getElementById('phoneNumber').value;

        const response = await fetch(endpoints.resetPassword, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, phoneNumber }),
            credentials: 'include'
        });

        const result = await response.json();
        
        if (response.status === 200) {
            sessionStorage.setItem('generatedOtp', result.generatedOtp);
            sessionStorage.setItem('messageSid', result.messageSid);
            alert('OTP sent successfully');
        } else {
            alert('Failed to send OTP');
        }
    });

    verifyOtpBtn.addEventListener('click', async () => {
        const userId = document.getElementById('user-id').value;
        const otp = document.getElementById('otpInput').value;
        const newPassword = prompt('Enter your new password:');

        const storedOtp = sessionStorage.getItem('generatedOtp');
        const storedMessageSid = sessionStorage.getItem('messageSid');

        const response = await fetch(endpoints.verify, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, otp, newPassword, generatedOtp: storedOtp, messageSid: storedMessageSid }),
            credentials: 'include'
        });

        const result = await response.json();
        
        alert(result.message);

        if (response.status === 200) {
            otpModal.style.display = 'none';
            sessionStorage.removeItem('generatedOtp');
            sessionStorage.removeItem('messageSid');
        }
    });
});
