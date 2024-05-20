const connection = require("../connection");


const rateContent = async (contentId, rateData) => {
    const {rating, username} = rateData;

    try{
        await(await connection).beginTransaction();

        const queryInsertRate = "INSERT INTO rate (value, username) VALUES (?,?)";

        await (await connection).execute(
            queryInsertRate, 
            [rating, username]
        );

        const queryGetRateId = "SELECT LAST_INSERT_ID() AS rateId"

        const [rows] = await (await connection).execute(queryGetRateId);
        const rateId = rows[0].rateId; 

        const queryInsertContentRate = "INSERT INTO contentRating (contentId, rateId) VALUES (?,?)";

        await (await connection).execute(
            queryInsertContentRate,
            [contentId, rateId]
        );

        await (await connection).commit();
        return {success: true};
    }catch(error) {
        await (await connection).rollback();
        console.error('Error trying to create rating: ', error);
        throw error;
    }

}

const getContent = async() => {
    try{
        const query = "SELECT * FROM content ORDER BY contentId DESC LIMIT 10"; 
        const [rows] = await (await connection).execute(query);
    
        return rows;
    } catch (error) {
        console.error('Error trying to get informative content');
        throw error;
    }
};

//Método para recuperar contenido por id
//Método para recuperar contenido de un usuario en específico para los 100tificos 

module.exports = {
    rateContent, 
    getContent
};