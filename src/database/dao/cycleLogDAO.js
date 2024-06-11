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

module.exports = {
    createCycleLog,
    deleteCycleLog,
    updateCycleLog,
    getCycleLogsByMonthAndUser
};