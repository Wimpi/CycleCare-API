const connection = require("../connection");

const getMenstrualCycleByUser = async (username) => {
    const query = `
        SELECT aproxCycleDuration, aproxPeriodDuration
        FROM menstrualCycle
        WHERE username = ?
    `;

    try {
        const [rows] = await (await connection).execute(query, [username]);

        if (!rows || rows.length === 0) {
            console.log('No menstrual cycle found for user:', username);
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error('Error en getMenstrualCycleByUser:', error);
        throw error;
    }
};

module.exports = {
    getMenstrualCycleByUser
};