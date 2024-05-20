const { 
    createReminder,
    updateReminder,
    getReminderById,
    getCurrentRemindersByUser,
    deleteReminder
} = require('../database/dao/reminderDAO');

const {scheduleReminderEmail, loadTemplate} = require('../utils/sendEmail');
const {
    findUserByUsername
} = require('../database/dao/userDAO');
const path = require('path');

const HttpStatusCodes = require('../utils/enums');

const registerReminder = async (req, res) => {
    const { description, title, date, time } = req.body;
    const creationDate = `${date} ${time}`;
    const { username } = req;

    try {
        const user = await findUserByUsername(username);
        const email = user.email;
        const reminder = { description, title, creationDate, username, email }; // Incluye email en el recordatorio
        const result = await createReminder(reminder);

        if (result.success) {
            const templatePath = path.join(__dirname, '../templates/reminder-template.html');
            const htmlContent = loadTemplate(templatePath, { title, description, creationDate });
            scheduleReminderEmail(email, title, htmlContent, creationDate);

            res.status(HttpStatusCodes.CREATED).json({
                message: 'Reminder registered successfully',
                reminderId: result.reminderId
            });
        } else {
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "Error creating new reminder"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new reminder. Try again later"
        });
    }
};

const reminderUpdate = async (req, res) =>{
    const { reminderId } = req.params;
    const { description, title, date, time } = req.body;
    const creationDate = `${date} ${time}`;
    const { username } = req;
    try{
        const reminder = await getReminderById(reminderId);
        
        if(!reminder || reminder.username !== username) {
            res.status(HttpStatusCodes.FORBIDDEN).json({
                error: true,
                statusCode: HttpStatusCodes.FORBIDDEN,
                details: "You don't have permission to update this reminder"
            });
            return; 
        }
        const result = await updateReminder(reminderId, {description, title, creationDate, username});

        if(result.success){
            res.status(HttpStatusCodes.CREATED)
                .json({
                    message: 'Reminder updated succesfully'
                });
        } else {
            res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: result.message
            });
            return; 
        }
    } catch(error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error trying to update reminder. Try again later"
        });
    }
}

const getCurrentUserReminders = async (req, res) => {
    const { username } = req;

    try {
        if (!username) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error: true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Username is required"
            });
        }

        const reminders = await getCurrentRemindersByUser(username);

        if (!reminders || reminders.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "No reminders found for the user"
            });
        }

        res.status(HttpStatusCodes.OK).json(reminders);
    } catch (error) {
        console.error(error);

        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error retrieving reminders. Try again later"
        });
    }
};

const removeReminder = async (req, res) => {
    const { reminderId } = req.params;
    const { username } = req;

    try {
        const result = await deleteReminder(reminderId, username);

        if (!result.success) {
            return res.status(HttpStatusCodes.FORBIDDEN).json({
                error: true,
                statusCode: HttpStatusCodes.FORBIDDEN,
                details: result.message
            });
        }

        res.status(HttpStatusCodes.OK).json({
            message: 'Reminder deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: 'Error deleting reminder. Try again later'
        });
    }
};


module.exports = {registerReminder, reminderUpdate, getCurrentUserReminders, removeReminder};