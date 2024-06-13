const {
    createCycleLog, 
    deleteCycleLog,
    updateCycleLog,
    getCycleLogsByMonthAndUser,
    getSymptomsByCycleLogId,
    getMoodsByCycleLogId,
    getMedicationsByCycleLogId,
    getPillsByCycleLogId,
    getBirthControlByCycleLogId, 
    getMenstrualFlow, 
    getVaginalFlow, 
    getCycleLogByDate, getLatestCycleLogByUser
} = require('../database/dao/cycleLogDAO');

const { getMenstrualCycleByUser } = require('../database/dao/menstrualCycleDAO');

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

const getCycleLogByDay = async (req, res) => {
    const { year, month, day } = req.params;
    const { username } = req;

    try {
        const cycleLog = await getCycleLogByDate(username, month, year, day);

        if (cycleLog) {
            res.status(HttpStatusCodes.OK).json(cycleLog);
        } else {
            res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                message: 'Cycle log not found'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving cycle log. Try again later'
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
    try {
        const cycleLogs = await getCycleLogsByMonthAndUser(month, year, username);

        if (!cycleLogs || cycleLogs.length === 0) {
            return [];
        }

        const detailedCycleLogs = await Promise.all(cycleLogs.map(async (log) => {
            try {
                const symptoms = await getSymptomsByCycleLogId(log.cycleLogId);
                const moods = await getMoodsByCycleLogId(log.cycleLogId);
                const medications = await getMedicationsByCycleLogId(log.cycleLogId);
                const pills = await getPillsByCycleLogId(log.cycleLogId);
                const birthControl = await getBirthControlByCycleLogId(log.cycleLogId);
                const cycleLogId = log.cycleLogId;
                const sleepHours = log.sleepHours;
                const username = log.username;
                const creationDate = log.creationDate;
                const note = log.note;
                const menstrualFlow = await getMenstrualFlow(log.menstrualFlowId);
                const vaginalFlow = await getVaginalFlow(log.vaginalFlowId);

                return {
                    cycleLogId,
                    creationDate,
                    menstrualFlow,
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
            } catch (innerError) {
                console.error('Error al obtener detalles de un ciclo:', innerError);
                throw error;
            }
        }));

        return detailedCycleLogs.filter(log => log !== null);
    } catch (error) {
        console.error('Error al obtener los ciclos detallados:', error);
        throw error;
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

const getCyclePrediction = async (req, res) => {
    const { username } = req;

    try {
        const latestCycleLog = await getLatestCycleLogByUser(username);

        if (!latestCycleLog) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                message: 'No cycle logs found for the user'
            });
        }
        const menstrualCycleInfo = await getMenstrualCycleByUser(username);

        if (!menstrualCycleInfo) {
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND,
                message: 'Menstrual cycle information not found for the user'
            });
        }

        const { aproxPeriodDuration, aproxCycleDuration } = menstrualCycleInfo;
        const lastPeriodDate = new Date(latestCycleLog.creationDate);

        const nextPeriodStartDate = new Date(lastPeriodDate);
        nextPeriodStartDate.setDate(nextPeriodStartDate.getDate() + aproxCycleDuration);
        const nextPeriodEndDate = new Date(nextPeriodStartDate);
        nextPeriodEndDate.setDate(nextPeriodEndDate.getDate() + aproxPeriodDuration);

        res.status(HttpStatusCodes.OK).json({
            nextPeriodStartDate,
            nextPeriodEndDate
        });
    } catch (error) {
        console.error('Error retrieving cycle prediction:', error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            message: 'Error retrieving cycle prediction. Try again later'
        });
    }
};

module.exports = {
    registerCycleLog,
    updateCycleLogEntry,
    getCycleLogs,
    removeCycleLog, getCycleLogByDay, getCyclePrediction
};