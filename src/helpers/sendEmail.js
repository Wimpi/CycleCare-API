const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
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
        text
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;