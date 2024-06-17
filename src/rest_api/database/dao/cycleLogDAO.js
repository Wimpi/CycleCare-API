const connection = require("../connection");

const createCycleLog = async (cycleLog) => {
    const { username, creationDate, menstrualFlowId, symptoms, moods, medications, pills, birthControls } = cycleLog;
    try {
        await (await connection).beginTransaction();
        
        const [result] = await (await connection).execute(
            'INSERT INTO cycleLog (username, creationDate) VALUES (?, ?)',
            [username, creationDate]
        );

        const cycleLogId = result.insertId;
        
        updateCycleData(cycleLogId, cycleLog);

        insertPeriodData(username, menstrualFlowId, creationDate);

        insertEnumCycleData(cycleLogId, symptoms, moods, medications, pills, birthControls);

        await (await connection).commit();

        return { success: true, cycleLogId };
    } catch (error) {
        await (await connection).rollback();
        console.error('Error al crear el ciclo:', error);
        throw error;
    }
};

const insertEnumCycleData = async (cycleLogId, symptoms, moods, medications, pills, birthControls) => {
    
    if (symptoms !== null && Array.isArray(symptoms) && symptoms.length > 0) {
        for (const symptom of symptoms) {
            await (await connection).execute(
                'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                [symptom.symptomId, cycleLogId]
            );
        }
    }

    if (moods !== null && Array.isArray(moods) && moods.length > 0) {
        for (const mood of moods) {
            await (await connection).execute(
                'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                [mood.moodId, cycleLogId]
            );
        }
    }

    if (medications !== null && Array.isArray(medications) && medications.length > 0) {
        for (const medication of medications) {
            await (await connection).execute(
                'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                [medication.medicationId, cycleLogId]
            );
        }
    }

    if (pills !== null && Array.isArray(pills) && pills.length > 0) {
        for (const pill of pills) {
            await (await connection).execute(
                'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                [pill.pillId, cycleLogId]
            );
        }
    }

    if (birthControls !== null && Array.isArray(birthControls) && birthControls.length > 0) {
        for (const birthControl of birthControls) {
            await (await connection).execute(
                'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                [birthControl.birthControlId, cycleLogId]
            );
        }
    }
}

const updateCycleLog = async (cycleLogId, updatedCycleLog) => {
    const { symptoms, moods, medications, pills, birthControls } = updatedCycleLog;

    try {
        await (await connection).beginTransaction();

        updateCycleData(cycleLogId, updatedCycleLog);

        await (await connection).execute('DELETE FROM symptomLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM moodLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM medicationLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM pillLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM birthControlLog WHERE cycleLogId = ?', [cycleLogId]);

        insertEnumCycleData(cycleLogId, symptoms, moods, medications, pills, birthControls);

        await (await connection).commit();

        return { success: true };
    } catch (error) {
        await (await connection).rollback();
        console.error('Error al actualizar el ciclo:', error);
        throw error;
    }
};

const insertPeriodData = async (username, menstrualFlowId, creationDate) => {
    const [periodRows] = await (await connection).execute(
        'SELECT * FROM period WHERE username = ? ORDER BY startDate DESC LIMIT 1',
        [username]
    );

    if (periodRows.length === 0 && menstrualFlowId !== null) {
        await (await connection).execute(
            'INSERT INTO period (username, startDate, endDate) VALUES (?, ?, ?)',
            [username, creationDate, creationDate]
        );
    } else if (periodRows.length > 0) {
        const lastPeriod = periodRows[0];
        const lastEndDate = new Date(lastPeriod.endDate);
        const lastStartDate = new Date(lastPeriod.startDate);
        const currentStartDate = new Date(creationDate);

        const lastEndDateAdjusted = new Date(lastEndDate.getFullYear(), lastEndDate.getMonth(), lastEndDate.getDate(), 0, 0, 0, 0);
        const lastStartDateAdjusted = new Date(lastStartDate.getFullYear(), lastStartDate.getMonth(), lastStartDate.getDate(), 0, 0, 0, 0);
        const currentStartDateAdjusted = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth(), currentStartDate.getDate(), 0, 0, 0, 0);

        const oneDayInMilliseconds = 86400000;
        const differenceWithEndDate = currentStartDateAdjusted.getTime() - lastEndDateAdjusted.getTime();
        const differenceWithStartDate = currentStartDateAdjusted.getTime() - lastStartDateAdjusted.getTime();

        if (differenceWithEndDate === oneDayInMilliseconds) {

            await (await connection).execute(
                'UPDATE period SET endDate = ? WHERE periodId = ?',
                [creationDate, lastPeriod.periodId]
            );
        } else if (differenceWithStartDate === -oneDayInMilliseconds) {

            await (await connection).execute(
                'UPDATE period SET startDate = ? WHERE periodId = ?',
                [creationDate, lastPeriod.periodId]
            );
        } else {
            await (await connection).execute(
                'INSERT INTO period (username, startDate, endDate) VALUES (?, ?, ?)',
                [username, creationDate, creationDate]
            );
        }
    }
}

const updateCycleData = async (cycleLogId, updatedCycleLog) => {
    const { sleepHours, note, menstrualFlowId, vaginalFlowId } = updatedCycleLog;

    const updateQueries = [];
    const updateParams = [];
    
    if (sleepHours !== undefined) {
        if (sleepHours === null) {
            updateQueries.push('sleepHours = NULL');
        } else {
            updateQueries.push('sleepHours = ?');
            updateParams.push(sleepHours);
        }
    }

    if (note !== undefined) {
        if (note === null) {
            updateQueries.push('note = NULL');
        } else {
            updateQueries.push('note = ?');
            updateParams.push(note);
        }
    }

    if (menstrualFlowId !== undefined) {
        if (menstrualFlowId === null || menstrualFlowId == 0) {
            updateQueries.push('menstrualFlowId = NULL');
        } else {
            updateQueries.push('menstrualFlowId = ?');
            updateParams.push(menstrualFlowId);
        }
    }

    if (vaginalFlowId !== undefined) {
        if (vaginalFlowId === null || vaginalFlowId == 0) {
            updateQueries.push('vaginalFlowId = NULL');
        } else {
            updateQueries.push('vaginalFlowId = ?');
            updateParams.push(vaginalFlowId);
        }
    }

    if (updateQueries.length > 0) {
        const updateQuery = `UPDATE cycleLog SET ${updateQueries.join(', ')} WHERE cycleLogId = ?`;
        updateParams.push(cycleLogId);
        await (await connection).execute(updateQuery, updateParams);
    }
}

const deleteCycleLog = async (cycleLogId, username) => {
    try {
        await (await connection).beginTransaction();

        const [rows] = await (await connection).execute(
            'SELECT * FROM cycleLog WHERE cycleLogId = ? AND username = ?',
            [cycleLogId, username]
        );

        if (rows.length === 0) {
            return { success: false, message: 'No cycle log found or permission denied' };
        }

        await (await connection).execute('DELETE FROM symptomLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM moodLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM medicationLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM pillLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM birthControlLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM cycleLog WHERE cycleLogId = ?', [cycleLogId]);

        await (await connection).commit();
        return { success: true };
    } catch (error) {
        await (await connection).rollback();
        console.error('Error al eliminar el ciclo:', error);
        throw error;
    }
};

const getCycleLogsByMonthAndUser = async (month, year, username) => {
    try {
        const query = `
            SELECT * FROM cycleLog
            WHERE username = ? AND MONTH(creationDate) = ? AND YEAR(creationDate) = ?
        `;
        const [rows] = await (await connection).execute(query, [username, month, year]);
        return rows;
    } catch (error) {
        console.error('Error al obtener los ciclos:', error);
        throw error;
    }
};

const getSymptomsByCycleLogId = async (cycleLogId) => {
    try {
        const query = `
            SELECT s.symptomId, s.name
            FROM symptomLog sl
            JOIN symptom s ON sl.symptomId = s.symptomId
            WHERE sl.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener los síntomas:', error);
        throw error;
    }
};

const getMoodsByCycleLogId = async (cycleLogId) => {
    try {
        const query = `
            SELECT m.moodId, m.name
            FROM moodLog ml
            JOIN mood m ON ml.moodId = m.moodId
            WHERE ml.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener los moods:', error);
        throw error;
    }
};

const getMedicationsByCycleLogId = async (cycleLogId) => {
    try {
        const query = `
            SELECT m.medicationId, m.name
            FROM medicationLog ml
            JOIN medication m ON ml.medicationId = m.medicationId
            WHERE ml.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener los medicamentos:', error);
        throw error;
    }
};

const getPillsByCycleLogId = async (cycleLogId) => {
    try {
        const query = `
            SELECT p.pillId, p.status
            FROM pillLog pl
            JOIN pill p ON pl.pillId = p.pillId
            WHERE pl.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener las píldoras:', error);
        throw error;
    }
};

const getBirthControlByCycleLogId = async (cycleLogId) => {
    try {
        const query = `
            SELECT bc.birthControlId, bc.name, bc.status
            FROM birthControlLog bcl
            JOIN birthControl bc ON bcl.birthControlId = bc.birthControlId
            WHERE bcl.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener el método anticonceptivo:', error);
        throw error;
    }
};

const getMenstrualFlow = async (menstrualFlowId) => {
    if (menstrualFlowId === null) {
        return null;
    }

    try {
        const query = "SELECT * FROM menstrualFlow WHERE menstrualFlowId = ?";
        const [rows] = await (await connection).execute(query, [menstrualFlowId]);
        if (rows.length > 0) {
            return rows[0];
        }
    } catch (error) {
        console.error('Error al obtener el flujo menstrual:', error);
        throw error;
    }
};

const getVaginalFlow = async (vaginalFlowId) => {
    if (vaginalFlowId === null) {
        return null;
    }

    try {
        const query = "SELECT * FROM vaginalFlow WHERE vaginalFlowId = ?";
        const [rows] = await (await connection).execute(query, [vaginalFlowId]);
        if (rows.length > 0) {
            return rows[0];
        }
    } catch (error) {
        console.error('Error al obtener el flujo vaginal:', error);
        throw error;
    }
};

const getCycleLogByDate = async (username, month, year, day) => {
    try {
        const [cycleLogRows] = await (await connection).execute(
            'SELECT * FROM cycleLog WHERE username = ? AND MONTH(creationDate) = ? AND YEAR(creationDate) = ? AND DAY(creationDate) = ?',
            [username, month, year, day]
        );

        if (cycleLogRows.length === 0) {
            return null;
        }

        const cycleLog = cycleLogRows[0];
        const cycleLogId = cycleLog.cycleLogId;

        const [symptomsRows] = await (await connection).execute(
            'SELECT symptomId FROM symptomLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const symptoms = symptomsRows.map(row => ({ symptomId: row.symptomId }));

        const [moodsRows] = await (await connection).execute(
            'SELECT moodId FROM moodLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const moods = moodsRows.map(row => ({ moodId: row.moodId }));

        const [medicationsRows] = await (await connection).execute(
            'SELECT medicationId FROM medicationLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const medications = medicationsRows.map(row => ({ medicationId: row.medicationId }));

        const [pillsRows] = await (await connection).execute(
            'SELECT pillId FROM pillLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const pills = pillsRows.map(row => ({ pillId: row.pillId }));

        const [birthControlsRows] = await (await connection).execute(
            'SELECT birthControlId FROM birthControlLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const birthControls = birthControlsRows.map(row => ({ birthControlId: row.birthControlId }));

        return {
            ...cycleLog,
            symptoms,
            moods,
            medications,
            pills,
            birthControls
        };
    } catch (error) {
        console.error('Error al recuperar el ciclo:', error);
        throw error;
    }
};

const getLatestCycleLogByUser = async (username) => {
    const query = `
        SELECT *
        FROM cycleLog
        WHERE username = ?
        ORDER BY creationDate DESC
        LIMIT 1
    `;

    try {
        const [rows] = await (await connection).execute(query, [username]);
        
        if (!rows || rows.length === 0) {
            console.log('No cycle log found for user:', username);
            return null;
        }

        return rows[0];
    } catch (error) {
        console.error('Error en getLatestCycleLogByUser:', error);
        throw error;
    }
};

module.exports = {
    createCycleLog,
    deleteCycleLog,
    updateCycleLog,
    getCycleLogsByMonthAndUser,
    getSymptomsByCycleLogId,
    getMoodsByCycleLogId,
    getMedicationsByCycleLogId,
    getPillsByCycleLogId,
    getBirthControlByCycleLogId, 
    getMenstrualFlow, getVaginalFlow, getCycleLogByDate, getLatestCycleLogByUser
};