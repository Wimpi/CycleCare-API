const { request, response } = require("express");
const { generateJWT } = require('../helpers/createJWT');
const { findUserByEmail, updateUserPassword } = require('../database/dao/userDAO');
const {sendEmail, loadTemplate} = require('../helpers/sendEmail');
const HttpStatusCodes = require('../helpers/enums');
const crypto = require('crypto');
const path = require('path');
const { login, 
        postUser, 
    } = require("../database/dao/userDAO");

const resetTokens = {};
const userLogin = async (req, res = response) => {
    const {username, password} = req.body;
    try {
        const user = await login(username, password);
        if(user==null){
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Invalid credentials. Please check your username and password and try again"
            });
            return; 
        }
        const token = await generateJWT(username);
        res.status(HttpStatusCodes.CREATED)
                .json({
                    token,
                    ...user
                });
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error logging in. Try again later"
        });
    }
}

const registerNewUser = async(req, res = response) => {
    const {email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration} = req.body;

    if(!email || !name || !firstLastName || !secondLastName ||!username ||!password || !role || isRegular == undefined ||!aproxCycleDuration ||!aproxPeriodDuration){
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid data. Please check your request and try again"
        });
        return; 
    }

    try {
        const user = {email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration};
        const result = await postUser(user);
        res.status(HttpStatusCodes.CREATED).json
        ({
            message: 'User registered succesfully',
            email: result.email
        });
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new user. Try again later"
        });
    }
}

const requestReset = async (req, res) => {
    const { email } = req.body;

    try {
        const emailFound = await findUserByEmail(email);
        if (emailFound == null) {
            res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Email not found. Try again."
            });
            return; 
        }

        const resetToken = crypto.randomBytes(4).toString('hex');
        const expiryTime = Date.now() + 3600000;

        resetTokens[email] = { token: resetToken, expiry: expiryTime };

        const templatePath = path.join(__dirname, '../templates/email-template.html');
        const htmlContent = loadTemplate(templatePath, { code: resetToken });

        await sendEmail(emailFound, 'Password Reset Request', htmlContent);

        res.status(HttpStatusCodes.CREATED).json
        ({
            message: 'Email sent. Check your inbox'
        });
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error sending email. Try again later"
        });
    }
};

const verifyResetCode = async (req, res) => {
    const { email, token } = req.body;

    const record = resetTokens[email];

    if (!record || record.token !== token || record.expiry < Date.now()) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Incorrect code or expired."
        });
        return
    }
    res.status(HttpStatusCodes.CREATED).json
        ({
            message: 'Code verified'
        });
};

const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Passwords don't match"
        });
        return
    }

    try {
        const updateResult = await updateUserPassword(email, newPassword);
        delete resetTokens[email];
        if(updateResult.success == true){
            res.status(200).json({ message: "Password updated successfully" });
        } else {
            res.status(400).json({ message: "No user found with the given email" });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating password. Try again later"
        });
    }
};

module.exports = { userLogin, registerNewUser, requestReset, verifyResetCode, resetPassword};