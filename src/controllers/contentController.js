//post contenido
//get all contenido
//get un contenido
//update contenido
//get promedio de calificacion por contenido

const { error } = require('console');
const fs = require('fs').promises;

const {
    rateContent, 
    getContent, 
    registerArticle
} = require('../database/dao/contentDAO');

const HttpStatusCodes = require('../utils/enums');
const { stat } = require('fs');
const path = require('path');

const publishContent = async (req, res) => {
    const {title, description, creationDate, image} = req.body;    
    const {username} = req;
    try{

        const directory = path.join(__dirname, '..','multimedia');
        const filename = `image_${Date.now()}.bmp`

        await fs.writeFile(path.join(directory, filename), imageBuffer);

        const article = {title, description, creationDate, filename, username}
        const result = await registerArticle(article);
        
        if(result.success) {
            res.status(HttpStatusCodes.CREATED).json({
                error: false,
                statusCode: HttpStatusCodes.CREATED,
                details: "Article created"});
                
        } else { 
            res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
                error: true,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
                details: "Error creating new article"
            });
        }

    }catch(error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error:true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error trying to publish content. Try again later"
        });
    }
}

const contentRate = async (req, res) => {
    const {contentId} = req.params;
    const {rating} = req.body;
    const {username} = req;

    try{
        const result = await rateContent(contentId, {rating, username});

        if(result.success) {
            res.status(HttpStatusCodes.CREATED)
                    .json({
                        message: 'The content was rating succesfully'
                    });
        } else {
            res.staus(HttpStatusCodes.NOT_FOUND).json({
                error: true, 
                statusCode: HttpStatusCodes.NOT_FOUND,
                details: result.message
            });
            return
        }
    } catch(error) {
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error:true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            details: "Error trying to rating content. Try again later"
        });
    }
};

const getInformativeContent = async(req, res) => {
    try {
        const informativeContent = await getContent();
        if(!informativeContent || informativeContent.length === 0){
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true, 
                statusCode: HttpStatusCodes.NOT_FOUND, 
                details: "Not informative content found"
            });
        }
        res.status(HttpStatusCodes.OK).json(informativeContent);
    } catch (error){
        console.error(error);
        
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR, 
            details: "Error retrieving informative content. Try again later"
        });
    }
};

module.exports = {contentRate, getInformativeContent, publishContent};