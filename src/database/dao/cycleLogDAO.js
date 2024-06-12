const connection = require("../connection");

const createCycleLog = async (cycleLog) => {
    const { username, creationDate, note, menstrualFlowId, vaginalFlowId, symptoms, moods, medications, pills, birthControls } = cycleLog;
    console.log(cycleLog);
    try {
        await (await connection).beginTransaction();

        // Insertar el registro principal en cycleLog (solo username)
        const [result] = await (await connection).execute(
            'INSERT INTO cycleLog (username, creationDate) VALUES (?, ?)',
            [username, creationDate]
        );

        const cycleLogId = result.insertId;

        // Insertar note si no es null
        if (note !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET note = ? WHERE cycleLogId = ?',
                [note, cycleLogId]
            );
        }

        // Insertar menstrualFlowId si no es null
        if (menstrualFlowId !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET menstrualFlowId = ? WHERE cycleLogId = ?',
                [menstrualFlowId, cycleLogId]
            );
        }

        // Insertar vaginalFlowId si no es null
        if (vaginalFlowId !== null) {
            await (await connection).execute(
                'UPDATE cycleLog SET vaginalFlowId = ? WHERE cycleLogId = ?',
                [vaginalFlowId, cycleLogId]
            );
        }

        // Insertar síntomas si no es null y tiene elementos
        if (symptoms !== null && Array.isArray(symptoms) && symptoms.length > 0) {
            for (const symptomId of symptoms) {
                await (await connection).execute(
                    'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                    [symptomId, cycleLogId]
                );
            }
        }

        // Insertar moods si no es null y tiene elementos
        if (moods !== null && Array.isArray(moods) && moods.length > 0) {
            for (const moodId of moods) {
                await (await connection).execute(
                    'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                    [moodId, cycleLogId]
                );
            }
        }

        // Insertar medications si no es null y tiene elementos
        if (medications !== null && Array.isArray(medications) && medications.length > 0) {
            for (const medicationId of medications) {
                await (await connection).execute(
                    'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                    [medicationId, cycleLogId]
                );
            }
        }

        // Insertar pills si no es null y tiene elementos
        if (pills !== null && Array.isArray(pills) && pills.length > 0) {
            for (const pillId of pills) {
                await (await connection).execute(
                    'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                    [pillId, cycleLogId]
                );
            }
        }

        // Insertar birthControls si no es null y tiene elementos
        if (birthControls !== null && Array.isArray(birthControls) && birthControls.length > 0) {
            for (const birthControlId of birthControls) {
                await (await connection).execute(
                    'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                    [birthControlId, cycleLogId]
                );
            }
        }

        // Commit de la transacción
        await (await connection).commit();

        return { success: true, cycleLogId };
    } catch (error) {
        // Rollback en caso de error
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
    const { note, menstrualFlowId, vaginalFlowId, symptoms, moods, medications, pills, birthControls } = updatedCycleLog;

    try {
        await (await connection).beginTransaction();

        // Actualizar el registro principal en cycleLog
        const updateQueries = [];
        if (note !== undefined) {
            if (note === null) {
                updateQueries.push('note = NULL');
            } else {
                updateQueries.push('note = ?');
            }
        }
        if (menstrualFlowId !== undefined) {
            if (menstrualFlowId === null) {
                updateQueries.push('menstrualFlowId = NULL');
            } else {
                updateQueries.push('menstrualFlowId = ?');
            }
        }
        if (vaginalFlowId !== undefined) {
            if (vaginalFlowId === null) {
                updateQueries.push('vaginalFlowId = NULL');
            } else {
                updateQueries.push('vaginalFlowId = ?');
            }
        }

        if (updateQueries.length > 0) {
            const updateQuery = `UPDATE cycleLog SET ${updateQueries.join(', ')} WHERE cycleLogId = ?`;
            const updateParams = [];
            if (note !== undefined && note !== null) updateParams.push(note);
            if (menstrualFlowId !== undefined && menstrualFlowId !== null) updateParams.push(menstrualFlowId);
            if (vaginalFlowId !== undefined && vaginalFlowId !== null) updateParams.push(vaginalFlowId);
            updateParams.push(cycleLogId);

            await (await connection).execute(updateQuery, updateParams);
        }

        // Eliminar los registros anteriores de síntomas, estados de ánimo, medicamentos, píldoras y métodos anticonceptivos asociados
        await (await connection).execute('DELETE FROM symptomLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM moodLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM medicationLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM pillLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM birthControlLog WHERE cycleLogId = ?', [cycleLogId]);
        
        // Insertar síntomas si no es null y tiene elementos
        if (symptoms !== null && Array.isArray(symptoms) && symptoms.length > 0) {
            for (const symptomId of symptoms) {
                await (await connection).execute(
                    'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                    [symptomId, cycleLogId]
                );
            }
        }

        // Insertar moods si no es null y tiene elementos
        if (moods !== null && Array.isArray(moods) && moods.length > 0) {
            for (const moodId of moods) {
                await (await connection).execute(
                    'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                    [moodId, cycleLogId]
                );
            }
        }

        // Insertar medications si no es null y tiene elementos
        if (medications !== null && Array.isArray(medications) && medications.length > 0) {
            for (const medicationId of medications) {
                await (await connection).execute(
                    'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                    [medicationId, cycleLogId]
                );
            }
        }

        // Insertar pills si no es null y tiene elementos
        if (pills !== null && Array.isArray(pills) && pills.length > 0) {
            for (const pillId of pills) {
                await (await connection).execute(
                    'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                    [pillId, cycleLogId]
                );
            }
        }

        // Insertar birthControls si no es null y tiene elementos
        if (birthControls !== null && Array.isArray(birthControls) && birthControls.length > 0) {
            for (const birthControlId of birthControls) {
                await (await connection).execute(
                    'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                    [birthControlId, cycleLogId]
                );
            }
        }
        
        // Commit de la transacción
        await (await connection).commit();

        return { success: true };
    } catch (error) {
        // Rollback en caso de error
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
            JOIN symptoms s ON sl.symptomId = s.symptomId
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
            JOIN moods m ON ml.moodId = m.moodId
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
            JOIN medications m ON ml.medicationId = m.medicationId
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
            JOIN pills p ON pl.pillId = p.pillId
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
            JOIN birthControls bc ON bcl.birthControlId = bc.birthControlId
            WHERE bcl.cycleLogId = ?
        `;
        const [rows] = await (await connection).execute(query, [cycleLogId]);
        return rows;
    } catch (error) {
        console.error('Error al obtener el método anticonceptivo:', error);
        throw error;
    }
};

const getMenstrualFlow = async (menstrualFlowId) =>{
    try{
        const query = "SELECT * FROM mensturalFlow WHERE menstrualFlowId = ?";
        const [rows] = await (await connection).execute(query,[menstrualFlowId]);
        return rows;
    }  catch (error) {
        console.error('Error al obtener el flujo menstrual:', error);
        throw error;
    }
}

const getVaginalFlow = async(vaginalFlowId) =>{
    try {
        const query = "SELECT * FROM vaginalFlow WHERE vaginalFlow = ?"
        const [rows] = await (await connection).execute(query, [vaginalFlowId]);
        return rows;
    } catch (error) {
        
    }
}

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
    getMenstrualFlow, getVaginalFlow
};