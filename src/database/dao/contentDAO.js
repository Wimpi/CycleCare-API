const connection = require("../connection");


const registerArticle = async(article) =>{
    try {
        const query = "INSERT INTO content (title, description, creationDate, media, username, isVideo) VALUES (?, ?, ?, ?, ?, ?)";
        await(await connection).execute(
            query, 
            [article.title, article.description, article.creationDate, article.filename, article.username, 0]
        );
        return {success: true}
    } catch (error) {
        await (await connection).rollback();
        console.error("Article register error:", error);
        throw error;
    }
}

const updateArticle = async(article) => {
    try{
        const query = "UPDATE content SET title = ?, description = ?, media = ? WHERE contentId = ?";
        const [result] = await (await connection).execute(
          query, 
          [article.title, article.description, article.filename, article.contentId]
        );
        return {success: true}
    } catch (error) {
        console.error('Error trying to update informative content from DAO: ', error);
        throw error;
    }
}


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
        const query = "SELECT * FROM content WHERE isVideo = 0 ORDER BY contentId DESC LIMIT 10"; 
        const [rows] = await (await connection).execute(query);
    
        return rows;
    } catch (error) {
        console.error('Error trying to get informative content');
        throw error;
    }
};

const getArticlesByUsername = async(username) => {
    try{
        const query = 'SELECT * FROM content WHERE username = ? AND isVideo = 0'

        const [rows] = await(await connection).execute(
            query, 
            [username]
        );

        return rows;
    } catch (error) {
        console.error('Error trying to get articles from the database');
        throw error;
    }
};

const getContentById = async(contentId) => {
    try{
        const query = 'SELECT * FROM content WHERE contentId =  ?'
        const [rows] = await(await connection).execute(
            query, 
            [contentId]
        );
        return rows
    } catch (error) {
        console.error('Error trying to get article from database');
        throw error;
    }
};

const getAvarage = async(contentId) => {
    try{
        const query = "SELECT AVG(r.value) AS contentAVG FROM contentRating cr JOIN rate r ON cr.rateId = r.rateId WHERE cr.contentId = ?"
        const [rows] = await(await connection).execute(
            query, 
            [contentId]
        );
        return rows;
    } catch(error) {
        console.error('Error trying to get AVG: ', error);
        throw error;
    }
}

//Método para recuperar contenido por id

module.exports = {
    rateContent, 
    getContent, 
    registerArticle, 
    getArticlesByUsername, 
    getContentById, 
    updateArticle, 
    getAvarage};