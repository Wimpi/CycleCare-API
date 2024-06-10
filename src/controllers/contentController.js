//post contenido
//get all contenido
//get un contenido
//update contenido
//get promedio de calificacion por contenido

const { error } = require('console');
const fs = require('fs');
const moment = require('moment');

const {
    rateContent, 
    getContent, 
    registerArticle, 
    getArticlesByUsername
} = require('../database/dao/contentDAO');

const HttpStatusCodes = require('../utils/enums');
const path = require('path');
const { match } = require('assert');
const directory = path.join(__dirname, '..', 'multimedia');

const publishContent = async (req, res) => {
    const {title, description, creationDate, image} = req.body;    
    const {username} = req;
    console.log("Sí pasé por aquí");
    try{
        const filename = `image_${Date.now()}.jpg`
        saveImage(image, filename)
        const article = {title, description, creationDate, filename, username}
        const result = await registerArticle(article);
        
        if(result.success) {
            res.status(HttpStatusCodes.CREATED).json({
                error: false,
                statusCode: HttpStatusCodes.CREATED,
                details: "Article created"});
                
        } else { 
            console.error("No he podido registrar el contenido");
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

function saveImage(base64Image, filename){
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let imageData = base64Image;

    if(matches){
        imageData = matches[2];
    }

    const imageBuffer = Buffer.from(imageData, 'base64');
    const filePath = path.join(directory, filename);
    fs.writeFileSync(filePath, imageBuffer);
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

const getArticleByMedic = async(req, res) => {
    const {username} = req;
    
    try{
        const result = await getArticlesByUsername(username);
            if(!result || result.length === 0){
                return res.status(HttpStatusCodes.NOT_FOUND).json({
                    error:true, 
                    statusCode: HttpStatusCodes.NOT_FOUND, 
                    details: "No articles found for the user"
            });
        }
        res.status(HttpStatusCodes.OK).json({articles: result});

    } catch (error){
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true, 
            statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR, 
            details: "Error retrieving articles. Try again later"
        });
    }
};

module.exports = {contentRate, getInformativeContent, publishContent, getArticleByMedic};