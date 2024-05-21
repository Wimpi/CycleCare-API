const connection = require("../connection");

const getSleepHours = async(username) =>{
    try{
        const query = "SELECT sleepHours, creationDate FROM cycleLog " + 
        "WHERE username = ? && creationDate "+ 
        "BETWEEN DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY) AND NOW();"

        const[rows] = await (await connection).execute(
            query,
            [username]
        );

        return rows;
    }catch (error){
        console.error('Error trying to get sleep information');
        throw error;    
    }
};



module.exports = {
    getSleepHours
};