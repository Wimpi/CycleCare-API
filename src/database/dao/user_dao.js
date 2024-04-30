const connection = require("../connection");

const login = async (username, password) => {
    console.log("password: " + password);
    console.log("user: " + username);
    const query = 'SELECT email, role FROM user WHERE username = ? AND password = ?';
    let loginResult = null;
    try {
        const [rows, fields] = await (await connection).execute(query, [username, password]);

        if (rows.length > 0) {

            loginResult = {
                email: rows[0].email,
                role: rows[0].role
            };
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        throw error;
    }

    return loginResult;
}

module.exports = { login };