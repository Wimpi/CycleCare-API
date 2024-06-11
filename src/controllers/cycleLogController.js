const {
    createCycleLog, 
    deleteCycleLog, 
    updateCycleLog, 
    getCycleLogsByMonthAndUser
} = require('../database/dao/cycleLogDAO');

const HttpStatusCodes = require('../utils/enums');

const registerCycleLog = async (req, res) => {
    const { sleepHours, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls } = req.body;
    const { username } = req;

    const cycleLog = { sleepHours, username, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls };

    try {
        const result = await createCycleLog(cycleLog);

        if (result.success) {
            res.status(HttpStatusCodes.CREATED).json({
                message: 'Cycle log registered successfully',
                cycleLogId: result.cycleLogId
            });
        } else {
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "Error creating new cycle log"
            });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error creating new cycle log. Try again later"
        });
    }
};

const updateCycleLogEntry = async (req, res) => {
    const { cycleLogId } = req.params;
    const { sleepHours, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls } = req.body;
    const { username } = req;

    const updatedCycleLog = { sleepHours, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls, username };

    try {
        const result = await updateCycleLog(cycleLogId, updatedCycleLog);

        if (result.success) {
            res.status(HttpStatusCodes.OK).json({
                message: 'Cycle log updated successfully'
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
            details: "Error updating cycle log. Try again later"
        });
    }
};

const getCycleLogs = async (req, res) => {
    const { username } = req;
    const { month, year } = req.query;

    try {
        const result = await getCycleLogsByMonthAndUser(month, year, username);

        if (!result || result.length === 0) {
            res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "No cycle logs found for the specified month and user"
            });
        } else {
            res.status(HttpStatusCodes.OK).json(result);
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error retrieving cycle logs. Try again later"
        });
    }
};

const removeCycleLog = async (req, res) => {
    const { cycleLogId } = req.params;
    const { username } = req;

    try {
        const result = await deleteCycleLog(cycleLogId, username);

        if (!result.success) {
            res.status(HttpStatusCodes.FORBIDDEN).json({
                error: true,
                statusCode: HttpStatusCodes.FORBIDDEN,
                details: result.message
            });
        } else {
            res.status(HttpStatusCodes.OK).json({
                message: 'Cycle log deleted successfully'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: 'Error deleting cycle log. Try again later'
        });
    }
};

module.exports = {
    registerCycleLog,
    updateCycleLogEntry,
    getCycleLogs,
    removeCycleLog
};