const connection = require("../connection");

const createCycleLog = async (cycleLog) => {
    const { sleepHours, username, creationDate, note, menstrualFlowId, vaginalFlowId, symptoms, moods, medications, pills, birthControls } = cycleLog;
    try {
        await (await connection).beginTransaction();
        
        const [result] = await (await connection).execute(
            'INSERT INTO cycleLog (username, creationDate) VALUES (?, ?)',
            [username, creationDate]
        );

        const cycleLogId = result.insertId;

        if(sleepHours !== null){
            await (await connection).execute(
                'UPDATE cycleLog SET sleepHours = ? WHERE cycleLogId = ?',
                [sleepHours, cycleLogId]
            );
        }
        
        if (note !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET note = ? WHERE cycleLogId = ?',
                [note, cycleLogId]
            );
        }

        if (menstrualFlowId !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET menstrualFlowId = ? WHERE cycleLogId = ?',
                [menstrualFlowId, cycleLogId]
            );
        }

        if (vaginalFlowId !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET vaginalFlowId = ? WHERE cycleLogId = ?',
                [vaginalFlowId, cycleLogId]
            );
        }

        if (symptoms !== null && Array.isArray(symptoms) && symptoms.length > 0) {
            for (const symptomId of symptoms) {
                await (await connection).execute(
                    'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                    [symptomId, cycleLogId]
                );
            }
        }

        if (moods !== null && Array.isArray(moods) && moods.length > 0) {
            for (const moodId of moods) {
                await (await connection).execute(
                    'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                    [moodId, cycleLogId]
                );
            }
        }

        if (medications !== null && Array.isArray(medications) && medications.length > 0) {
            for (const medicationId of medications) {
                await (await connection).execute(
                    'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                    [medicationId, cycleLogId]
                );
            }
        }

        if (pills !== null && Array.isArray(pills) && pills.length > 0) {
            for (const pillId of pills) {
                await (await connection).execute(
                    'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                    [pillId, cycleLogId]
                );
            }
        }

        if (birthControls !== null && Array.isArray(birthControls) && birthControls.length > 0) {
            for (const birthControlId of birthControls) {
                await (await connection).execute(
                    'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                    [birthControlId, cycleLogId]
                );
            }
        }

        await (await connection).commit();

        return { success: true, cycleLogId };
    } catch (error) {
        await (await connection).rollback();
        console.error('Error al crear el ciclo:', error);
        throw error;
    }
};

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

const updateCycleLog = async (cycleLogId, updatedCycleLog) => {
    const { sleepHours, note, menstrualFlowId, vaginalFlowId, symptoms, moods, medications, pills, birthControls } = updatedCycleLog;

    try {
        await (await connection).beginTransaction();

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
            if (menstrualFlowId === null) {
                updateQueries.push('menstrualFlowId = NULL');
            } else {
                updateQueries.push('menstrualFlowId = ?');
                updateParams.push(menstrualFlowId);
            }
        }
        if (vaginalFlowId !== undefined) {
            if (vaginalFlowId === null) {
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

        await (await connection).execute('DELETE FROM symptomLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM moodLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM medicationLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM pillLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM birthControlLog WHERE cycleLogId = ?', [cycleLogId]);

        if (symptoms !== null && Array.isArray(symptoms) && symptoms.length > 0) {
            for (const symptomId of symptoms) {
                await (await connection).execute(
                    'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                    [symptomId, cycleLogId]
                );
            }
        }

        if (moods !== null && Array.isArray(moods) && moods.length > 0) {
            for (const moodId of moods) {
                await (await connection).execute(
                    'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                    [moodId, cycleLogId]
                );
            }
        }

        if (medications !== null && Array.isArray(medications) && medications.length > 0) {
            for (const medicationId of medications) {
                await (await connection).execute(
                    'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                    [medicationId, cycleLogId]
                );
            }
        }

        if (pills !== null && Array.isArray(pills) && pills.length > 0) {
            for (const pillId of pills) {
                await (await connection).execute(
                    'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                    [pillId, cycleLogId]
                );
            }
        }

        if (birthControls !== null && Array.isArray(birthControls) && birthControls.length > 0) {
            for (const birthControlId of birthControls) {
                await (await connection).execute(
                    'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                    [birthControlId, cycleLogId]
                );
            }
        }

        await (await connection).commit();

        return { success: true };
    } catch (error) {
        await (await connection).rollback();
        console.error('Error al actualizar el ciclo:', error);
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
        return rows;
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
        return rows;
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
        const symptoms = symptomsRows.map(row => row.symptomId);

        const [moodsRows] = await (await connection).execute(
            'SELECT moodId FROM moodLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const moods = moodsRows.map(row => row.moodId);

        const [medicationsRows] = await (await connection).execute(
            'SELECT medicationId FROM medicationLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const medications = medicationsRows.map(row => row.medicationId);

        const [pillsRows] = await (await connection).execute(
            'SELECT pillId FROM pillLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const pills = pillsRows.map(row => row.pillId);

        const [birthControlsRows] = await (await connection).execute(
            'SELECT birthControlId FROM birthControlLog WHERE cycleLogId = ?',
            [cycleLogId]
        );
        const birthControls = birthControlsRows.map(row => row.birthControlId);

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
    getMenstrualFlow, getVaginalFlow, getCycleLogByDate
};