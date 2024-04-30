const { request, response } = require("express");
const { generateJWT } = require('../helpers/create_JWT');
const { login } = require("../database/dao/user_dao");

const userLogin = async (req, res = response) => {
    const { username, password } = req.body;
    try {
        const loginResult = await login(username, password);
        const token = await generateJWT(username);
        res.json({
            username: loginResult.email,
            rol: loginResult.role,
            token
          });
    } catch (error) {
        console.error(error);
        res.status(404).json({ message: "Error logging in. Please check your username and password and try again", error });
    }
}

module.exports = { userLogin};