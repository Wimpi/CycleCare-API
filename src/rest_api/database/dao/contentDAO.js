const connection = require("../connection");


const registerArticle = async(article) =>{
    try {
        const query = "INSERT INTO content (title, description, creationDate, media, username, isVideo) VALUES (?, ?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'), ?, ?, ?)";
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

const registerVideo = async(video) =>{
    try {
        const query = "INSERT INTO content (title, creationDate, media, username, isVideo) VALUES (?, STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%sZ'), ?, ?, ?)";
        await(await connection).execute(
            query, 
            [video.title, video.creationDate, video.filename, video.username, 1]
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


const rateContent = async (contentId, rating, username) => {
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
        console.error('Error trying to create rating: ', error);
        await (await connection).rollback();
        throw error;
    }

}

const editRateContent = async (contentId, rating, username) => {
    try{
        const query = "UPDATE rate r JOIN contentRating cr ON r.rateId = cr.rateId SET r.value = ? WHERE r.username = ? AND cr.contentId = ?";

        await (await connection).execute(
            query, 
            [rating, username, contentId]
        );

        return {success: true};
    }catch(error) {
        console.error('Error trying to create rating: ', error);
        await (await connection).rollback();
        throw error;
    }

}

const getRate = async (contentId, username) => {
    try{
        const query = "SELECT r.value FROM rate r JOIN contentRating cr ON r.rateId = cr.rateId WHERE r.username = ? AND cr.contentId = ?"

        const[rows] = await (await connection).execute(
            query, 
            [username, contentId]
        );
        if(rows.length>0){
            return rows;
        }else{
            console.log("No se encontró")
        }
    }catch(error){
        console.error('Error trying to create rating: ', error);
        await (await connection).rollback();
        throw error;
    }
}

const getContent = async() => {
    try{
        const query = "SELECT contentId, title, description, DATE_FORMAT(creationDate, '%Y-%m-%dT%H:%i:%sZ'),  media, username, isVideo FROM content WHERE isVideo = 0 ORDER BY contentId DESC LIMIT 10";
        const [rows] = await (await connection).execute(query);
    
        return rows;
    } catch (error) {
        console.error('Error trying to get informative content');
        throw error;
    }
};

const getArticlesByUsername = async(username) => {
    try{
        const query = 'SELECT contentId, title, description, DATE_FORMAT(creationDate, \'%Y-%m-%dT%H:%i:%sZ\'),  media, username, isVideo FROM content WHERE username = ? AND isVideo = 0'

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
        const query = 'SELECT contentId, title, description, DATE_FORMAT(creationDate, \'%Y-%m-%dT%H:%i:%sZ\'),  media, username, isVideo FROM content WHERE contentId =  ?'
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

        if(rows.length > 0){
            return rows[0];
        }
    } catch(error) {
        console.error('Error trying to get AVG: ', error);
        throw error;
    }
}

module.exports = {
    rateContent, 
    getContent, 
    registerArticle, 
    getArticlesByUsername, 
    getContentById, 
    updateArticle, 
    getAvarage, 
    registerVideo, 
    editRateContent, 
    getRate};
