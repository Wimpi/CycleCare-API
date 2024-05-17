const { request, response } = require("express");
const { generateJWT } = require('../helpers/createJWT');
const { findUserByEmail, updateUserPassword } = require('../database/dao/userDAO');
const sendEmail = require('../helpers/sendEmail');
const crypto = require('crypto');
const { login, 
        postUser, 
    } = require("../database/dao/userDAO");

const resetTokens = {};
const userLogin = async (req, res = response) => {
    const { username, password } = req.body;
    try {
        const loginResult = await login(username, password);
        const token = await generateJWT(username);
        if(loginResult!=null){
            res.json({
                loginResult,
                rol: loginResult.role,
                token
            });
        } else {
            res.status(404).json({ message: "Invalid credentials. Please check your username and password and try again"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in. Try again later"});
    }
}

const registerNewUser = async(req, res = response) => {
    const {email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration} = req.body;

    if(!email || !name || !firstLastName || !secondLastName ||!username ||!password || !role || isRegular == undefined ||!aproxCycleDuration ||!aproxPeriodDuration){
        return res.status(400).json({message: 'Information invalid'});
    }

    try {
        const user = {email, name, firstLastName, secondLastName, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration};
        const result = await postUser(user);
        return res.status(201).json({
            message: 'User registered succesfully',
            email: result.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error register user. Try again later"}); 
    }
}

const requestReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Correo no encontrado" });
        }

        const resetToken = crypto.randomBytes(4).toString('hex');
        const expiryTime = Date.now() + 3600000;

        resetTokens[email] = { token: resetToken, expiry: expiryTime };

        await sendEmail(user.email, 'Password Reset Request', `Tu código es ${resetToken}`);

        res.status(200).json({ message: "Correo enviado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error enviando el correo. Inténtalo de nuevo más tarde" });
    }
};

const verifyResetCode = async (req, res) => {
    const { email, token } = req.body;

    const record = resetTokens[email];

    if (!record || record.token !== token || record.expiry < Date.now()) {
        return res.status(400).json({ message: "Código incorrecto o expirado" });
    }

    res.status(200).json({ message: "Código verificado" });
};

const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Las contraseñas no coinciden" });
    }

    try {
        await updateUserPassword(email, newPassword);
        delete resetTokens[email];
        res.status(200).json({ message: "Contraseña actualizada" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error actualizando la contraseña. Inténtalo de nuevo más tarde" });
    }
};

module.exports = { userLogin, registerNewUser, requestReset, verifyResetCode, resetPassword};