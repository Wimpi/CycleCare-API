const { request, response } = require("express");
const { generateJWT } = require('../helpers/createJWT');

const { login, 
        postUser, 
    } = require("../database/dao/userDAO");

const userLogin = async (req, res = response) => {
    const { username, password } = req.body;
    try {
        const loginResult = await login(username, password);
        const token = await generateJWT(username);
        if(loginResult!=null){
            res.json({
                username: loginResult.email,
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
    const {email, name, firstLastName, secondLastName, birthdate, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration} = req.body;

    if(!email || !name || !firstLastName || !secondLastName ||!birthdate ||!username ||!password || !role || isRegular == undefined ||!aproxCycleDuration ||!aproxPeriodDuration){
        return res.status(400).json({message: 'Information invalid'});
    }

    try {
        const user = {email, name, firstLastName, secondLastName, birthdate, username, password, role, isRegular, aproxCycleDuration, aproxPeriodDuration};
        const result = await postUser(user);
        return res.status(201).json({
            message: 'User registered succesfully',
            result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error register user. Try again later"}); 
    }
}

module.exports = { userLogin, registerNewUser};