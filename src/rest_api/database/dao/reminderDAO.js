const connection = require("../connection");

const createReminder = async (reminder) => {
    const { description, title, creationDate, username} = reminder;

    try{
        const [result] = await(await connection).execute(
            'INSERT INTO reminder (description, title, creationDate, username) VALUES (?,?,?,?)',
            [description, title, creationDate, username]
        );

        return { success: true, reminderId: result.insertId};
    } catch  (error) {
        console.error ('Error al crear el recortadorio: ', error);
        throw error;
    }
}

const updateReminderWithScheduleId = async (reminderId, scheduleId) => {
    try {
        const query = "UPDATE reminder SET scheduleId = ? WHERE reminderId = ?";
        await (await connection).execute(query, [scheduleId, reminderId]);
    } catch (error) {
        console.error('Error al actualizar el recordatorio con el ID de programación: ', error);
        throw error;
    }
};

const updateReminder = async (reminderId, newReminderData) => {
    const {description, title, creationDate, username} = newReminderData;
    
    try{
        const query = "UPDATE reminder SET description = ?, title = ?, creationDate = ? WHERE reminderId = ? AND username = ?";
        
        const [result] = await (await connection).execute(query, [description, title, creationDate, reminderId, username]);
        if(result.affectedRows > 0){
            return {success: true};
        } else {
            return {
                success: false,
                message: "We couldn't find the reminder to update"
            };
        }
    } catch (error){
        console.error('Error trying to update reminder: ', error);
        throw error;
    }
}

const getReminderById = async (reminderId) => {
    try {
        const [rows] = await (await connection).execute(
            "SELECT * FROM reminder WHERE reminderId = ?",
            [reminderId]
        );

        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error atrying to get reminder by ID: ", error);
        throw error;
    }
};

const getCurrentRemindersByUser = async (username) => {
    try {
        const [rows] = await (await connection).execute(
            'SELECT * FROM reminder WHERE username = ? AND creationDate >= MICROSECOND(NOW()) AND YEAR(creationDate) >= YEAR(NOW()) AND MONTH(creationDate) >= MONTH(NOW()) AND DAY(creationDate) >= DAY(NOW())',
            [username]
        );

        return rows;
    } catch (error) {
        console.error('Error trying to get the reminders of the user: ', error);
        throw error;
    }
};

const deleteReminder = async (reminderId, username) => {
    try {
        const [rows] = await (await connection).execute(
            'SELECT * FROM reminder WHERE reminderId = ? AND username = ?',
            [reminderId, username]
        );

        if (rows.length === 0) {
            return { success: false, message: 'No reminder found or permission denied' };
        }

        await (await connection).execute(
            'DELETE FROM reminder WHERE reminderId = ?',
            [reminderId]
        );

        return { success: true };
    } catch (error) {
        console.error('Error deleting reminder:', error);
        throw error;
    }
};

module.exports = {
    createReminder,
    updateReminder,
    getReminderById,
    getCurrentRemindersByUser, 
    updateReminderWithScheduleId,
    deleteReminder
};