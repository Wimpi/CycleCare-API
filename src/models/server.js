const express = require ('express');

const cors = require ('cors');

class Server{
    constructor(){
        this.app = express();
        this.port = process.env.APP_PORT;
        this.middleware();
        this.routes();
    }

    middleware(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static('public'));
    }

    routes(){
        this.app.use("/apicyclecare/users", require('../routes/usersRoutes'));
        this.app.use("/apicyclecare/reminders", require('../routes/reminderRoutes'));
        this.app.use("/apicyclecare/logs", require('../routes/cycleLogRoutes'));
        this.app.use("/apicyclecare/content", require('../routes/contentRoutes'));
        this.app.use("/apicyclecare/chart", require('../routes/chartRoutes'));
    }

    listen() {
        this.app.listen(this.port, ()=>{
            console.log(`Cycle Care Server listening in port ${this.port}`);
        });
    }
}

module.exports = Server;