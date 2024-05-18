const { 
    createReminder,
    updateReminder,
    getReminderById
} = require('../database/dao/reminderDAO');

const HttpStatusCodes = require('../utils/enums');

const registerReminder = async (req, res) => {
    const {username, description, title, date, time} = req.body;
    const creationDate = `${date} ${time}`;

    try{
        const reminder = {description, title, creationDate, username};
        const result = await createReminder(reminder);
        if(result.success){
            res.status(HttpStatusCodes.CREATED)
                .json({
                    message: 'Reminder registered succesfully',
                    reminderId: result.reminderId
                });
        } else {
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "Error creating new reminder"
            });
            return; 
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new reminder. Try again later"
        });
    }
}

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

module.exports = {registerReminder, reminderUpdate};