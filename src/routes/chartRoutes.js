const {Router}  = require ('express');
const {validateJWT} = require('../middleware/validateJWT');

const{
    getSleepChartInformation} = require('../controllers/chartController');

const router = Router();

router.get('/obtain-sleep-hours', [validateJWT], getSleepChartInformation);

module.exports = router;