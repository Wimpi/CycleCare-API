const {
    createCycleLog, 
    deleteCycleLog, 
    updateCycleLog, 
    getCycleLogsByMonthAndUser,
    getMenstrualFlow,
    getVaginalFlow
} = require('../database/dao/cycleLogDAO');

const HttpStatusCodes = require('../utils/enums');

const registerCycleLog = async (req, res) => {
    const { sleepHours, creationDate, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls } = req.body;
    const { username } = req;

    const cycleLog = { sleepHours, username, creationDate, note, menstrualFlowId, vaginalFlowId, symptoms, sexualActivities, moods, medications, birthControls };

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
    const { month, year } = req.params;
    
    try {
        const detailedCycleLogs = await getDetailedCycleLogs(month, year, username);

        if (!detailedCycleLogs || detailedCycleLogs.length === 0) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: "No cycle logs found for the specified month and user"
            });
        }

        res.status(HttpStatusCodes.OK).json({ cycleLogs: detailedCycleLogs });
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error retrieving cycle logs. Try again later"
        });
    }
};

const getDetailedCycleLogs = async (month, year, username) => {
    const cycleLogs = await getCycleLogsByMonthAndUser(month, year, username);

    if (!cycleLogs || cycleLogs.length === 0) {
        return [];
    }

    const detailedCycleLogs = await Promise.all(cycleLogs.map(async (log) => {
        const symptoms = await getSymptomsByCycleLogId(log.cycleLogId);
        const moods = await getMoodsByCycleLogId(log.cycleLogId);
        const medications = await getMedicationsByCycleLogId(log.cycleLogId);
        const pills = await getPillsByCycleLogId(log.cycleLogId);
        const birthControl = await getBirthControlByCycleLogId(log.cycleLogId);
        const cycleLogId = log.cycleLogId;
        const sleepHours = log.sleepHours;
        const username = log.username;
        const note = log.note;
        const mensturalFlow = getMenstrualFlow(log.menstrualFlowId);
        const vaginalFlow = getVaginalFlow(log.vaginalFlowId);

        return {
            cycleLogId,
            mensturalFlow,
            vaginalFlow,
            sleepHours,
            username,
            note,
            symptoms,
            moods,
            medications,
            pills,
            birthControl
        };
    }));

    return detailedCycleLogs;
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