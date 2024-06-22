const{
    getSleepHours
} = require ('../database/dao/chartDAO');

const HttpStatusCodes = require ('../utils/enums');


const getSleepChartInformation = async (req, res) => {
    const {username} = req;
    try{
        if(!username) {
            return res.status(HttpStatusCodes.BAD_REQUEST).json({
                error:true,
                statusCode: HttpStatusCodes.BAD_REQUEST,
                details: "Username is required"
            });
        }

        const sleepHours = await getSleepHours(username);

        if (!sleepHours || sleepHours.length === 0){
            return res.status(HttpStatusCodes.NOT_FOUND).json({
                error: true,
                statusCode: HttpStatusCodes.NOT_FOUND, 
                details: "No registers found for the user"
            });
        }

        
        res.status(HttpStatusCodes.OK).json(sleepHours);
    }catch(error){
        console.error(error);
        res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({
            error:true,
            statuCode: HttpStatusCodes.INTERNAL_SERVER_ERROR, 
            details: "Error retriaving sleep hours. Try again later"
        });
    }
}

module.exports = {getSleepChartInformation};