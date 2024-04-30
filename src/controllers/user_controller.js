const { response } = require("express");
const { login, deleteUserByUsername, getUserInfoByUsername, updatePasswordByEmail } = require("../database/dao/user_dao");

const userLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await login(username, password);
    if (user) {
        res.status(200).json(user);
    } else {
        res.status(401).json({ message: "Nombre de usuario o contraseña incorrectos" });
    }
};

const deleteUser = async (req, res) => {
    const { username } = req.body;
    const success = await deleteUserByUsername(username);
    if (success) {
        res.status(200).json({ message: "Usuario eliminado correctamente" });
    } else {
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
};

const getUserInfo = async (req, res) => {
    const { username } = req.body;
    const userInfo = await getUserInfoByUsername(username);
    if (userInfo) {
        res.status(200).json(userInfo);
    } else {
        res.status(500).json({ message: "Error al obtener información del usuario" });
    }
};

const updatePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const result = await updatePasswordByEmail(email, newPassword);
    if (result.success) {
        res.status(200).json({ message: result.message });
    } else {
        res.status(500).json({ message: result.message });
    }
};

module.exports = { userLogin, deleteUser, getUserInfo, updatePassword };