const connection = require("../connection");

const login = async (username, password) => {
    const query = "SELECT u.email, u.role, p.name, p.firstLastname, p.secondLastName " +
    "FROM user u JOIN person p ON u.email = p.email WHERE u.username = ? AND u.password = ?"
    let loginResult = null;

    try {
        const [rows] = await (await connection).execute(query, [username, password]);

        if (rows.length > 0) {
            const user = rows[0];
            loginResult = {
                email: user.email,
                role: user.role,
                name: user.name,
                firstLastname: user.firstLastname,
                secondLastName: user.secondLastName
            };
        }
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }

    return loginResult;
};

const postUser = async (user) => {
    try{
        await (await connection).beginTransaction();

        await (await connection).execute(
            "INSERT INTO person (email, name, firstLastname, secondLastName) VALUES (?, ?, ?, ?)",
            [user.email, user.name, user.firstLastName, user.secondLastName]
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

        const [rows] = await (await connection).execute(
            "SELECT email FROM person WHERE email = ?",
            [user.email]
        );

        if (rows.length > 0) {
            return {
                email: rows[0].email
            };
        } else {
            throw new Error('Email not found after insertion');
        }

    } catch (error) {
        await (await connection).rollback();
        console.error("User register error:", error);
        throw error;
    }
}

const findUserByEmail = async (email) => {
    const query = 'SELECT email FROM user WHERE email = ?';
    let idResult = null;

    try {
        const [rows] = await (await connection).execute(query, [email]);

        if (rows.length > 0) {
            idResult = rows[0].email;
        }

    } catch (error) {
        console.error("Find user by email error:", error);
        throw error;
    }

    return idResult;
};

const updateUserPassword = async (email, newPassword) => {
    const query = 'UPDATE user SET password = ? WHERE email = ?';
    try {
        const [result] = await (await connection).execute(query, [newPassword, email]);

        if (result.affectedRows > 0) {
            return { success: true};
        } else {
            return { success: false};
        }
    } catch (error) {
        console.error("Updating user password error:", error);
        throw error;
    }
};

const findUserByUsername = async (username) => {
    const query = "SELECT u.email, u.role, p.name, p.firstLastname, p.secondLastName " +
    "FROM user u JOIN person p ON u.email = p.email WHERE u.username = ?";
    
    try {
        const [rows] = await (await connection).execute(query, [username]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("Error finding user by username:", error);
        throw error;
    }
};
module.exports = { 
    login, 
    postUser, findUserByEmail, updateUserPassword, findUserByUsername 
};