const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

const scheduledTasks = {};

const scheduleReminderEmail = (email, subject, htmlContent, date) => {
    const cronDate = new Date(date);
    const cronExpression = `${cronDate.getMinutes()} ${cronDate.getHours()} ${cronDate.getDate()} ${cronDate.getMonth() + 1} *`;

    const scheduleId = generateUniqueId();

    const job = cron.schedule(cronExpression, () => {
        sendEmail(email, subject, htmlContent);
    }, {
        scheduled: true,
        timezone: "America/Mexico_City"
    });

    scheduledTasks[scheduleId] = { job, email, subject, htmlContent };

    return scheduleId;
};


const deleteScheduled = (scheduleId) => {
    const job = scheduledTasks[scheduleId]?.job;
    if (job) {
        job.stop();
        delete scheduledTasks[scheduleId];
    }
};

const generateUniqueId = () => {
    return uuidv4();
};

module.exports = { scheduleReminderEmail, deleteScheduled };