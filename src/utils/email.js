const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendVerificationEmail(to, link) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verify Your Email',
        text: `Please click this link to verify your email: ${link}`,
    };
    await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail };