const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
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

const loadResetCodeTemplate = (filePath, replacements) => {
    const template = fs.readFileSync(filePath, 'utf8');
    return Object.keys(replacements).reduce((template, key) => {
        return template.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
    }, template);
};

const scheduleReminderEmail = (email, subject, htmlContent, date) => {
    const cronDate = new Date(date);
    const cronExpression = `${cronDate.getMinutes()} ${cronDate.getHours()} ${cronDate.getDate()} ${cronDate.getMonth() + 1} *`;

    cron.schedule(cronExpression, () => {
        sendEmail(email, subject, htmlContent);
    }, {
        scheduled: true,
        timezone: "America/New_York" // Ajusta la zona horaria según sea necesario
    });
};

module.exports = { sendEmail, loadResetCodeTemplate, scheduleReminderEmail };