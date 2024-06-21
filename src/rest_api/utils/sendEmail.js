const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (to, subject, htmlContent) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        html: htmlContent
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const loadTemplate = (filePath, replacements) => {
    try {
        const template = fs.readFileSync(filePath, 'utf8');
        return Object.keys(replacements).reduce((template, key) => {
            const escapedKey = key.replace(/[%]/g, '\\$&');
            const regex = new RegExp(`{${escapedKey}}`, 'g');
            return template.replace(regex, replacements[key]);
        }, template);
    } catch (err) {
        console.error(`Error reading file from path: ${filePath}`, err);
        return '';
    }
};

module.exports = { sendEmail, loadTemplate };