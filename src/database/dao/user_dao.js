const { pool } = require("../connection");

const login = async (username, password) => {
    try {
        const result = await pool.query(
            "SELECT * FROM user WHERE username = ? AND password = ?",
            [username, password]
        );
        return result[0];
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        return null;
    }
};

const deleteUserByUsername = async (username) => {
    try {
        await pool.query("DELETE FROM user WHERE username = ?", [username]);
        return true;
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return false;
    }
};

const getUserInfoByUsername = async (username) => {
    try {
        const result = await pool.query(
            "SELECT u.username, u.role, p.name, p.firstLastname, " +
            "p.secondLastName, p.birthdate FROM user u JOIN person p ON u.email " +
            "= p.email WHERE u.username = ?",
            [username]
        );
        return result[0];
    } catch (error) {
        console.error("Error al obtener información del usuario:", error);
        return null;
    }
};

const updatePasswordByEmail = async (email, newPassword) => {
    try {
        await pool.query(
            "UPDATE user SET password = ? WHERE email = ?",
            [newPassword, email]
        );
        return { success: true, message: "Contraseña actualizada correctamente" };
    } catch (error) {
        console.error("Error al actualizar contraseña:", error);
        return { success: false, message: "Error al actualizar contraseña" };
    }
};

module.exports = { login, deleteUserByUsername, getUserInfoByUsername, updatePasswordByEmail };