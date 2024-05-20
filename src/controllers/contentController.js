//post contenido
//get all contenido
//get un contenido
//update contenido
//calificar contenido
//get promedio de calificacion por contenido

const { error } = require('console');
const {
    rateContent, 
    getContent
} = require('../database/dao/contentDAO');

const HttpStatusCodes = require('../utils/enums');
const { stat } = require('fs');

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

module.exports = {contentRate, getInformativeContent};