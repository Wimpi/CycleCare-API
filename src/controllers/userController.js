const { request, response } = require("express");
const { generateJWT } = require('../middleware/createJWT');
const verifyResetCode = require('../middleware/validateResetCode');
const {sendEmail, loadTemplate} = require('../utils/sendEmail');
const HttpStatusCodes = require('../utils/enums');
const crypto = require('crypto');
const path = require('path');
const { login, 
        postUser, 
        findUserByEmail, 
        updateUserPassword,
        findUserByUsername
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

const registerNewUser = async (req, res = response) => {
    const { email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration } = req.body;

    if (!email || !name || !firstLastName || !secondLastName || !username || !password || !role || isRegular == undefined || !aproxCycleDuration || !aproxPeriodDuration) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid data. Please check your request and try again"
        });
    }

    try {
        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Email already registered. Please use a different email"
            });
        }

        const existingUsername = await findUserByUsername(username);
        if (existingUsername) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Username already taken. Please choose a different username"
            });
        }

        const newUser = {
            email,
            name,
            firstLastName,
            secondLastName,
            username,
            password,
            role,
            isRegular,
            aproxCycleDuration,
            aproxPeriodDuration
        };

        const result = await postUser(newUser);
        return res.status(HttpStatusCodes.CREATED).json({
            message: 'User registered successfully',
            email: result.email
        });
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new user. Try again later"
        });
    }
};

const requestReset = async (req, res) => {
    const { email } = req.params;

    try {
        const emailFound = await findUserByEmail(email);
        if (emailFound == null) {
            res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "Email not found. Try again."
            });
            return; 
        }

        const resetToken = crypto.randomBytes(4).toString('hex');
        const expiryTime = Date.now() + (5 * 60 * 1000);

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
const resetPassword = async (req, res) => {
    try {
        await updatePassword(req, res);
        const { email } = req.params;
        delete resetTokens[email];
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error resetting password. Try again later"
        });
    }
};

const updatePassword = async (req, res) => {
    const { email } = req.params;
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Passwords don't match"
        });
    }

    try {
        const updateResult = await updateUserPassword(email, newPassword);
        if (updateResult.success == true) {
            return res.status(HttpStatusCodes.OK).json({
                message: 'Password updated successfully'
            });
        } else {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "No user found with the given email"
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error updating password. Try again later"
        });
    }
};

module.exports = { 
    userLogin, 
    registerNewUser, 
    requestReset, 
    verifyResetCode, 
    resetPassword, resetTokens};