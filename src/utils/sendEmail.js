const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const sendEmail = async (to, subject, htmlContent) => {

    let transporter = nodemailer.createTransport({
        secure: true,
        requireTLS: true,
        port: 465,
        secured: true,
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
    const template = fs.readFileSync(filePath, 'utf8');
    return Object.keys(replacements).reduce((template, key) => {
        return template.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
    }, template);
};

module.exports = { sendEmail, loadTemplate };