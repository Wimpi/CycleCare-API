const connection = require("../connection");

const createCycleLog = async (cycleLog) => {
    const { sleepHours, username, creationDate, note, menstrualFlowId, vaginalFlowId, symptoms, moods, medications, pills, birthControlId } = cycleLog;

    try {

        await (await connection).beginTransaction();

        const [result] = await (await connection).execute(
            'INSERT INTO cycleLog (sleepHours, username, creationDate, note, menstrualFlowId, vaginalFlowId) VALUES (?, ?, ?, ?, ?, ?)',
            [sleepHours, username, creationDate, note, menstrualFlowId, vaginalFlowId]
        );

        const cycleLogId = result.insertId;

        for (const symptomId of symptoms) {
            await (await connection).execute(
                'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                [symptomId, cycleLogId]
            );
        }
        
        for (const moodId of moods) {
            await (await connection).execute(
                'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                [moodId, cycleLogId]
            );
        }
        
        for (const medicationId of medications) {
            await (await connection).execute(
                'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                [medicationId, cycleLogId]
            );
        }
        
        for (const pillId of pills) {
            await (await connection).execute(
                'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                [pillId, cycleLogId]
            );
        }
        
        if (birthControlId) {
            await (await connection).execute(
                'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                [birthControlId, cycleLogId]
            );
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
    const { sleepHours, note, menstrualFlowId, vaginalFlowId, username, symptoms, moods, medications, pills, birthControlId } = updatedCycleLog;

    try {
        await (await connection).beginTransaction();

        const query = `
            UPDATE cycleLog
            SET sleepHours = ?, note = ?, menstrualFlowId = ?, vaginalFlowId = ?
            WHERE cycleLogId = ? AND username = ?
        `;
        const [result] = await (await connection).execute(query, [
            sleepHours,
            note,
            menstrualFlowId,
            vaginalFlowId,
            cycleLogId,
            username
        ]);

        if (result.affectedRows === 0) {
            throw new Error("We couldn't find the cycle log to update");
        }

        await (await connection).execute('DELETE FROM symptomLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM moodLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM medicationLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM pillLog WHERE cycleLogId = ?', [cycleLogId]);
        await (await connection).execute('DELETE FROM birthControlLog WHERE cycleLogId = ?', [cycleLogId]);
        
        for (const symptomId of symptoms) {
            await (await connection).execute(
                'INSERT INTO symptomLog (symptomId, cycleLogId) VALUES (?, ?)',
                [symptomId, cycleLogId]
            );
        }
        
        for (const moodId of moods) {
            await (await connection).execute(
                'INSERT INTO moodLog (moodId, cycleLogId) VALUES (?, ?)',
                [moodId, cycleLogId]
            );
        }
        
        for (const medicationId of medications) {
            await (await connection).execute(
                'INSERT INTO medicationLog (medicationId, cycleLogId) VALUES (?, ?)',
                [medicationId, cycleLogId]
            );
        }
        
        for (const pillId of pills) {
            await (await connection).execute(
                'INSERT INTO pillLog (pillId, cycleLogId) VALUES (?, ?)',
                [pillId, cycleLogId]
            );
        }
        
        if (birthControlId) {
            await (await connection).execute(
                'INSERT INTO birthControlLog (birthControlId, cycleLogId) VALUES (?, ?)',
                [birthControlId, cycleLogId]
            );
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