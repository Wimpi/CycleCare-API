const { 
    createReminder,
    updateReminder,
    getReminderById,
    getCurrentRemindersByUser, updateReminderWithScheduleId,
    deleteReminder
} = require('../database/dao/reminderDAO');

const {loadTemplate} = require('../utils/sendEmail');
const {scheduleReminderEmail, deleteScheduled} = require('../utils/scheduleReminders');
const {
    findUserByUsername
} = require('../database/dao/userDAO');
const path = require('path');

const HttpStatusCodes = require('../utils/enums');

const registerReminder = async (req, res) => {
    const { description, title, creationDate } = req.body;
    const { username } = req;

    const validation = validateReminderInput(req.body);
    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }

    try {
        const user = await findUserByUsername(username);
        const email = user.email;
        const reminder = { description, title, creationDate, username, email };
        const result = await createReminder(reminder);

        if (result.success) {
            const templatePath = path.join(__dirname, '../templates/reminder-template.html');
            const htmlContent = loadTemplate(templatePath, { title, description, creationDate });
            const scheduleId = scheduleReminderEmail(email, title, htmlContent, creationDate);

            await updateReminderWithScheduleId(result.reminderId, scheduleId);

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

const descriptionPattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,200}$/;
const titlePattern = /^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ ]{1,70}$/;

const validateReminderInput = (data) => {
    const { description, title, creationDate } = data;

    if (!description || !description.match(descriptionPattern)) {
        return { valid: false, message: "Invalid description '" + description + "'. Please provide a valid description (1-200 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!title || !title.match(titlePattern)) {
        return { valid: false, message: "Invalid title '" + title + "'. Please provide a valid title (1-70 characters, only Spanish alphabet characters and spaces)." };
    }
    if (!creationDate || isNaN(Date.parse(creationDate))) {
        return { valid: false, message: "Invalid creation date '" + creationDate + "'. Please provide a valid date." };
    }

    return { valid: true };
};

const reminderUpdate = async (req, res) => {
    const { reminderId } = req.params;
    const { description, title, creationDate, scheduleId} = req.body;
    const { username } = req;

    const validation = validateUpdateReminderInput(req.body, reminderId);

    if (!validation.valid) {
        return res.status(HttpStatusCodes.BAD_REQUEST).json({
            error: true,
            statusCode: HttpStatusCodes.BAD_REQUEST,
            details: validation.message
        });
    }

    try {
        const reminder = await getReminderById(reminderId);
        
        if (!reminder || reminder.username !== username) {
            res.status(HttpStatusCodes.FORBIDDEN).json({
                error: true,
                statusCode: HttpStatusCodes.FORBIDDEN,
                details: "You don't have permission to update this reminder"
            });
            return; 
        }
        deleteScheduled(scheduleId);
        const result = await updateReminder(reminderId, {description, title, creationDate, username, scheduleId});

        if (result.success) {
            const templatePath = path.join(__dirname, '../templates/reminder-template.html');
            const htmlContent = loadTemplate(templatePath, { title, description, creationDate });
            const newScheduleId = scheduleReminderEmail(reminder.email, title, htmlContent, creationDate);
            
            await updateReminderWithScheduleId(reminderId, newScheduleId);

            res.status(HttpStatusCodes.CREATED).json({
                message: 'Reminder updated successfully'
            });
        } else {
            res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: result.message
            });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error trying to update reminder. Try again later"
        });
    }
}

const validateUpdateReminderInput = (data, reminderId) => {
    const { description, title, creationDate, scheduleId } = data;

    if (isNaN(reminderId)) {
        return { valid: false, message: "Invalid reminder ID. Please provide a valid number." };
    }
    if (scheduleId != null) {
        return { valid: false, message: "Invalid schedule ID." };
    }
    if (description !== undefined && !description.match(descriptionPattern)) {
        return { valid: false, message: "Invalid description '" + description + "'. Please provide a valid description (1-200 characters, only Spanish alphabet characters and spaces)." };
    }
    if (title !== undefined && !title.match(titlePattern)) {
        return { valid: false, message: "Invalid title '" + title + "'. Please provide a valid title (1-70 characters, only Spanish alphabet characters and spaces)." };
    }
    if (creationDate !== undefined && isNaN(Date.parse(creationDate))) {
        return { valid: false, message: "Invalid creation date '" + creationDate + "'. Please provide a valid date." };
    }

    return { valid: true };
};

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

        const result = await getCurrentRemindersByUser(username);

        if (!result || result.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "No reminders found for the user"
            });
        }

        res.status(HttpStatusCodes.OK).json({reminders: result});
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
        const reminder = await getReminderById(reminderId);

        if (!reminder || reminder.username !== username) {
            return res.status(HttpStatusCodes.FORBIDDEN).json({
                error: true,
                statusCode: HttpStatusCodes.FORBIDDEN,
                details: "You don't have permission to delete this reminder"
            });
        }
        
        deleteScheduled(reminder.scheduleId);

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
