const { request, response } = require("express");
const { generateJWT } = require('../helpers/createJWT');
const { login } = require("../database/dao/userDAO");

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

module.exports = { userLogin};