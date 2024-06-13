const express = require ('express');
const cors = require ('cors');
const swaggerUi = require("swagger-ui-express");
const { swaggerDocument} = require('../documentation/swagger');

class Server{
    constructor(){
        this.app = express();
        this.port = process.env.APP_PORT;
        this.middleware();
        this.routes();
    }

    middleware(){
        this.app.use(cors());
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(express.static('public'));
    }


    routes(){
        this.app.use("/apicyclecare/users", require('../routes/usersRoutes'));
        this.app.use("/apicyclecare/reminders", require('../routes/reminderRoutes'));
        this.app.use("/apicyclecare/logs", require('../routes/cycleLogRoutes'));
        this.app.use("/apicyclecare/content", require('../routes/contentRoutes'));
        this.app.use("/apicyclecare/chart", require('../routes/chartRoutes'));
        this.app.use("/images", express.static('multimedia'));
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }

    listen() {
        this.app.listen(this.port, ()=>{
            console.log(`Cycle Care Server listening in port ${this.port}`);
        });
    }
}

module.exports = Server;