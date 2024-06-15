const { request, response } = require("express");
const { generateJWT } = require('../utils/createJWT');
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
const e = require("express");

const resetTokens = {};

const userLogin = async (req, res = response) => {
    const {username, password} = req.body;
    const validation = validateLoginInput(username, password);
    
    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }
    
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

const usernamePattern = /^[a-zA-Z0-9._]{3,20}$/;
const validateLoginInput = (username, password) => {
    if (!username || typeof username !== 'string' || !username.match(usernamePattern)) {
        return { valid: false, message: "Invalid username. Please provide a valid username (3-20 characters, only letters, numbers, dots, and underscores)." };
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
        return { valid: false, message: "Invalid password. Please provide a valid password." };
    }
    return { valid: true };
};

const registerNewUser = async (req, res = response) => {
    const { email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration } = req.body;
    
    const validation = validateRegisterInput(req.body) && validateLoginInput(username, password);
    
    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }
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


const namePattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,69}$/;
const emailPattern = /^[A-Za-z0-9+_.-]{1,64}@[A-Za-z0-9.-]{1,63}$/;

const validateRegisterInput = (data) => {
    const { email, name, firstLastName, secondLastName, role, isRegular, aproxCycleDuration, aproxPeriodDuration } = data;

    if (!email || !email.match(emailPattern)) {
        return { valid: false, message: "Invalid email. Please provide a valid email address." };
    }
    if (!name || !name.match(namePattern)) {
        return { valid: false, message: "Invalid name. Please provide a valid name (1-69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!firstLastName || !firstLastName.match(namePattern)) {
        return { valid: false, message: "Invalid first last name. Please provide a valid first last name (1-69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!secondLastName || !secondLastName.match(namePattern)) {
        return { valid: false, message: "Invalid second last name. Please provide a valid second last name (1-69 characters, only Spanish alphabet characters and spaces)." };
    }
    if (role !== 'MEDIC' && role !== 'USER') {
        return { valid: false, message: "Invalid role. Role must be either 'MEDIC' or 'USER'." };
    }
    if (isRegular !== 0 && isRegular !== 1) {
        return { valid: false, message: "Invalid isRegular value. It must be either 0 or 1." };
    }
    if (isNaN(aproxCycleDuration) || aproxCycleDuration <= 0 || aproxCycleDuration > 99) {
        return { valid: false, message: "Invalid approximate cycle duration. It must be a number greater than 0 and less than 100." };
    }
    if (isNaN(aproxPeriodDuration) || aproxPeriodDuration <= 0 || aproxPeriodDuration > 99) {
        return { valid: false, message: "Invalid approximate period duration. It must be a number greater than 0 and less than 100." };
    }

    return { valid: true };
};

const requestReset = async (req, res) => {
    const { email } = req.params;
    if(!email || !email.match(emailPattern)){
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: "Invalid email. Please provide a valid email address."
        });
    }

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

        const templatePath = path.join(__dirname, '../templates/password-recovery-template.html');
        const htmlContent = loadTemplate(templatePath, { code: resetToken });

        await sendEmail(emailFound, 'Password Reset Request', htmlContent);

        res.status(HttpStatusCodes.CREATED).json({
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
        if(!email || !email.match(emailPattern)){
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Invalid email. Please provide a valid email address."
            });
        }
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

const validateUpdatePasswordInput = (newPassword, confirmPassword, email) => {
    if (!newPassword || !confirmPassword) {
        return { valid: false, message: "Invalid data. Please provide a new password and confirm it." };
    }

    if (newPassword !== confirmPassword) {
        return { valid: false, message: "Passwords don't match" };
    }
    if (!email || !email.match(emailPattern)) {
        return { valid: false, message: "Invalid email. Please provide a valid email address." };
    }
    return { valid: true };
}
const updatePassword = async (req, res) => {
    const { email } = req.params;
    const { newPassword, confirmPassword } = req.body;
    const validation = validateUpdatePasswordInput(newPassword, confirmPassword, email);

    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }
    try {
        const updateResult = await updateUserPassword(email, newPassword);
        if (updateResult.success) {
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