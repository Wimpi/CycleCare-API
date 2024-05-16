const connection = require("../connection");

const login = async (username, password) => {
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
        console.error("Login error:", error);
        throw error;
    }

    return loginResult;
}

const postUser = async (user) => {
    try{
        await (await connection).beginTransaction();

        await (await connection).execute(
            "INSERT INTO person (email, name, firstLastname, secondLastName, birthdate) VALUES (?, ?, ?, ?, ?)",
            [user.email, user.name, user.firstLastName, user.secondLastName, user.birthdate]
        );

        await (await connection).execute(
            "INSERT INTO user (username, password, role, email) VALUES (?, ?, ?, ?)",
            [user.username, user.password, user.role, user.email]
        );

        await (await connection).execute(
            "INSERT INTO menstrualCycle (username, isRegular, aproxCycleDuration, aproxPeriodDuration) VALUES (?, ?, ?, ?)",
            [user.username, user.isRegular, user.aproxCycleDuration, user.aproxPeriodDuration]
        );

        await (await connection).commit();
        return { message: 'User registered successfully' };
    } catch (error) {
        await (await connection).rollback();
        console.error("User register error:", error);
        throw error;
    }
}

module.exports = { 
    login, 
    postUser 
};