const connection = require("../connection");

const getSleepHours = async(username) =>{
    try{
        const query = 
        "SELECT DAYNAME(creationDate) AS dayOfWeek, SUM(sleepHours) AS totalSleepHours FROM cycleLog WHERE username = ? AND creationDate BETWEEN DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY) AND CURDATE() GROUP BY DAYOFWEEK(creationDate), DAYNAME(creationDate) ORDER BY DAYOFWEEK(creationDate)"

        const[rows] = await (await connection).execute(
            query,
            [username]
        );

        const daysOfWeekMap = {
            Sunday: 'Sunday',
            Monday: 'Monday',
            Tuesday: 'Tuesday',
            Wednesday: 'Wednesday',
            Thursday: 'Thursday',
            Friday: 'Friday',
            Saturday: 'Saturday'
        };

        const result = rows.map(row => ({
            dayOfWeek: daysOfWeekMap[row.dayOfWeek],
            totalSleepHours: row.totalSleepHours
        }));

        return result;
    }catch (error){
        console.error('Error trying to get sleep information');
        throw error;    
    }
};



module.exports = {
    getSleepHours
};